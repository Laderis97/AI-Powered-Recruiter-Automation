// src/server.ts

import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { planLayover } from './orchestrator';
import { createContext } from './context';
import flightsData from './data/samples/flights.sample.json';
import constraintsData from './data/samples/constraints.sample.json';
import { CrewPairing, Constraints } from './data/types';
import { createSupabaseService } from './services/supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase service (will gracefully handle missing config)
let supabaseService: ReturnType<typeof createSupabaseService> | null = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabaseService = createSupabaseService();
    console.log('✅ Supabase integration enabled');
  } else {
    console.log('ℹ️ Supabase integration disabled (using local data)');
  }
} catch (error) {
  console.warn('⚠️ Supabase initialization failed, using local data:', error.message);
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with your actual domain
    : true, // Allow all origins in development
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'crew-accommodations-planner',
    version: '0.1.0',
    environment: process.env.NODE_ENV,
    features: {
      supabaseIntegration: !!supabaseService,
      liveMapsAPI: process.env.ENABLE_LIVE_MAPS_API === 'true',
      liveHotelAPI: process.env.ENABLE_LIVE_HOTEL_API === 'true',
    },
    services: {} as Record<string, any>,
  };

  // Check Supabase health if available
  if (supabaseService) {
    try {
      const supabaseHealth = await supabaseService.healthCheck();
      health.services.supabase = supabaseHealth;
    } catch (error) {
      health.services.supabase = { status: 'error', error: error.message };
      health.status = 'degraded';
    }
  }

  res.json(health);
});

// Get available pairings
app.get('/api/pairings', (req, res) => {
  try {
    const flights = flightsData as CrewPairing[];
    res.json({
      success: true,
      pairings: flights,
      count: flights.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get current constraints
app.get('/api/constraints', (req, res) => {
  try {
    res.json({
      success: true,
      constraints: constraintsData as Constraints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Plan layover for a specific pairing
app.post('/api/plan-layover', async (req, res) => {
  try {
    const { pairingId, constraints: customConstraints } = req.body;
    
    // Find the pairing
    const flights = flightsData as CrewPairing[];
    const pairing = flights.find(p => p.id === pairingId);
    
    if (!pairing) {
      return res.status(404).json({
        success: false,
        error: `Pairing ${pairingId} not found`,
      });
    }
    
    // Use custom constraints or defaults
    const constraints = customConstraints || (constraintsData as Constraints);
    
    // Create context and run planning
    const ctx = createContext(constraints);
    const result = await planLayover(pairing, ctx);
    
    res.json({
      success: true,
      result,
      processing: {
        pairingId,
        timestamp: new Date().toISOString(),
        auditRecords: result.audit.length,
      },
    });
  } catch (error) {
    console.error('Error planning layover:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Planning failed',
    });
  }
});

// Run planning for all pairings (demo endpoint)
app.post('/api/plan-all', async (req, res) => {
  try {
    const { constraints: customConstraints } = req.body;
    const flights = flightsData as CrewPairing[];
    const constraints = customConstraints || (constraintsData as Constraints);
    
    const results = [];
    
    for (const pairing of flights) {
      try {
        const ctx = createContext(constraints);
        const result = await planLayover(pairing, ctx);
        results.push({
          pairingId: pairing.id,
          success: true,
          result,
        });
      } catch (error) {
        results.push({
          pairingId: pairing.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    res.json({
      success: true,
      results,
      summary: {
        total: flights.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Bulk planning failed',
    });
  }
});

// Simple dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Crew Accommodations Planner</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .btn { background: #1e40af; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
        .btn:hover { background: #1d4ed8; }
        .result { margin-top: 10px; padding: 10px; border-radius: 6px; }
        .success { background: #dcfce7; color: #166534; }
        .error { background: #fef2f2; color: #dc2626; }
        .loading { background: #fef3c7; color: #d97706; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        pre { background: #f8fafc; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛫 Crew Accommodations Planner</h1>
          <p>Multi-Agent Hotel Selection System for Flight Crews</p>
        </div>
        
        <div class="grid">
          <div class="card">
            <h3>🚀 Quick Demo</h3>
            <p>Run the planning algorithm on all sample pairings:</p>
            <button class="btn" onclick="runDemo()">Run Full Demo</button>
            <div id="demo-result"></div>
          </div>
          
          <div class="card">
            <h3>📊 Current Configuration</h3>
            <div id="config-display">Loading...</div>
          </div>
        </div>
        
        <div class="card">
          <h3>✈️ Available Pairings</h3>
          <div id="pairings-list">Loading...</div>
        </div>
        
        <div class="card">
          <h3>📋 Planning Results</h3>
          <div id="results-display">Click "Run Full Demo" to see results</div>
        </div>
      </div>

      <script>
        // Load initial data
        loadPairings();
        loadConfig();
        
        async function loadPairings() {
          try {
            const response = await fetch('/api/pairings');
            const data = await response.json();
            
            if (data.success) {
              displayPairings(data.pairings);
            }
          } catch (error) {
            document.getElementById('pairings-list').innerHTML = '<div class="error">Error loading pairings</div>';
          }
        }
        
        async function loadConfig() {
          try {
            const response = await fetch('/api/constraints');
            const data = await response.json();
            
            if (data.success) {
              displayConfig(data.constraints);
            }
          } catch (error) {
            document.getElementById('config-display').innerHTML = '<div class="error">Error loading config</div>';
          }
        }
        
        function displayPairings(pairings) {
          const html = pairings.map(p => {
            const lastLeg = p.legs[p.legs.length - 1];
            return \`
              <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                <strong>\${p.id}</strong> - \${p.members.length} crew, \${p.legs.length} legs<br>
                <small>Route: \${p.legs[0].depIata} → \${lastLeg.arrIata} | Arrival: \${new Date(lastLeg.arrUtc).toLocaleString()}</small>
              </div>
            \`;
          }).join('');
          
          document.getElementById('pairings-list').innerHTML = html;
        }
        
        function displayConfig(constraints) {
          const html = \`
            <div>
              <strong>Max Commute:</strong> \${constraints.maxCommuteMinutes} minutes<br>
              <strong>Min Rating:</strong> \${constraints.minHotelRating}/5<br>
              <strong>Max Rate:</strong> $\${constraints.maxNightlyUsd}<br>
              <strong>Preferred Brands:</strong> \${constraints.preferredBrands?.join(', ') || 'None'}<br>
              <strong>Min Reviews:</strong> \${constraints.minReviews}<br>
              <strong>Min Rest:</strong> \${constraints.minRestHours} hours
            </div>
          \`;
          
          document.getElementById('config-display').innerHTML = html;
        }
        
        async function runDemo() {
          const btn = event.target;
          const resultDiv = document.getElementById('demo-result');
          const resultsDiv = document.getElementById('results-display');
          
          btn.disabled = true;
          btn.textContent = 'Planning...';
          resultDiv.innerHTML = '<div class="loading">Running multi-agent planning pipeline...</div>';
          resultsDiv.innerHTML = '<div class="loading">Processing all pairings...</div>';
          
          try {
            const response = await fetch('/api/plan-all', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({})
            });
            
            const data = await response.json();
            
            if (data.success) {
              resultDiv.innerHTML = \`
                <div class="success">
                  ✅ Planning completed!<br>
                  <strong>\${data.summary.successful}/\${data.summary.total}</strong> pairings successfully planned
                </div>
              \`;
              
              displayResults(data.results);
            } else {
              resultDiv.innerHTML = \`<div class="error">❌ Planning failed: \${data.error}</div>\`;
            }
          } catch (error) {
            resultDiv.innerHTML = \`<div class="error">❌ Error: \${error.message}</div>\`;
          } finally {
            btn.disabled = false;
            btn.textContent = 'Run Full Demo';
          }
        }
        
        function displayResults(results) {
          const html = results.map(r => {
            if (!r.success) {
              return \`
                <div class="error" style="margin-bottom: 15px;">
                  <strong>\${r.pairingId}</strong> - Failed: \${r.error}
                </div>
              \`;
            }
            
            const result = r.result;
            const chosen = result.chosen;
            
            if (!chosen) {
              return \`
                <div class="error" style="margin-bottom: 15px;">
                  <strong>\${r.pairingId}</strong> - No suitable hotels found in \${result.city}
                </div>
              \`;
            }
            
            return \`
              <div class="success" style="margin-bottom: 15px;">
                <strong>\${r.pairingId}</strong> - \${result.city} (\${result.arrAirport})<br>
                <strong>Selected:</strong> \${chosen.name} (\${chosen.brand})<br>
                <strong>Details:</strong> \${chosen.etaMinutes}min travel, $\${chosen.rate?.nightly}/night, \${chosen.rating}/5 rating<br>
                <small>Evaluated \${result.candidates.length} candidates, \${result.audit.length} audit records</small>
              </div>
            \`;
          }).join('');
          
          document.getElementById('results-display').innerHTML = html;
        }
      </script>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🌐 Server running at http://localhost:${PORT}`);
  console.log(`📖 Visit the dashboard to interact with the system`);
  console.log(`🔧 API endpoints:`);
  console.log(`   GET  /api/pairings     - List available pairings`);
  console.log(`   GET  /api/constraints  - Current constraint settings`);
  console.log(`   POST /api/plan-layover - Plan specific pairing`);
  console.log(`   POST /api/plan-all     - Plan all pairings`);
});

export default app;