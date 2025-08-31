# Crew Accommodations Planner — Multi‑Agent MVP

A sophisticated multi-agent system for planning flight crew layovers and booking compliant hotel accommodations. Built with TypeScript and designed for modularity, extensibility, and explainability.

## 🎯 Overview

This system automates the complex process of finding suitable hotel accommodations for flight crews during layovers by:

- **Ingesting** flight schedules and crew pairings
- **Analyzing** arrival cities and contextual factors  
- **Sourcing** candidate hotels with real-time rates
- **Calculating** precise travel times from airports
- **Enforcing** airline contract constraints and compliance rules
- **Optimizing** selections based on cost, quality, and preferences
- **Providing** full audit trails and explainable decisions

## 🏗️ Architecture

The system uses a **multi-agent architecture** where each concern is encapsulated as an independent agent:

```
Flight Ingest → City Context → Hotel Sourcing → Geo/Distance → Contract Compliance → Schedule Optimizer
                                    ↓
                          Preference Analysis ← Rate Negotiation ← Audit & Explainability
```

Each agent is a stateless function that:
- Takes specific inputs and produces well-defined outputs
- Has access to shared `AgentContext` for configuration and caching
- Emits `DecisionRecord` entries for complete audit trails
- Can be developed, tested, and deployed independently

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
# Clone or create the project
cd crew-accom

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run the demo
npm run dev
```

### Sample Output

```
🛫 Starting layover planning for pairing PAIR001
Crew: 3 members, 1 legs

📋 Step 1: Flight Ingest
🏙️ Step 2: City Context Analysis  
🏨 Step 3: Hotel Sourcing
📍 Step 4: Geo Distance Calculation
✅ Step 5: Contract Compliance Check
⭐ Step 6: Preference Analysis
💰 Step 7: Rate Negotiation Analysis
🎯 Step 8: Schedule Optimization

✅ Planning complete!
Selected: Hilton Seattle Airport
Location: 17620 International Blvd, SEA Demo Ave
Travel time: 12 minutes
Rate: $199/night
Rating: 4.2/5 (1250 reviews)
```

## 📁 Project Structure

```
crew-accom/
├── src/
│   ├── agents/           # Individual agent implementations
│   │   ├── flightIngest.ts
│   │   ├── cityContext.ts
│   │   ├── hotelSourcing.ts
│   │   ├── geoDistance.ts
│   │   ├── contractCompliance.ts
│   │   ├── scheduleOptimizer.ts
│   │   ├── preference.ts
│   │   ├── rateNegotiation.ts
│   │   └── audit.ts
│   ├── data/
│   │   ├── types.ts      # TypeScript interfaces
│   │   ├── schemas.ts    # Zod validation schemas
│   │   └── samples/      # Sample data for development
│   ├── services/         # External service interfaces
│   │   ├── maps.ts       # Mapping/distance APIs
│   │   ├── ota.ts        # Hotel booking APIs
│   │   ├── flights.ts    # Flight data APIs
│   │   ├── cache.ts      # Caching layer
│   │   └── db.ts         # Database operations
│   ├── context.ts        # Shared agent context
│   ├── orchestrator.ts   # Main pipeline coordinator
│   └── index.ts          # Demo application
├── prompts/              # Agent prompt templates (future AI integration)
├── package.json
├── tsconfig.json
└── README.md
```

## 🤖 Agents Overview

| Agent | Purpose | Key Logic |
|-------|---------|-----------|
| **Flight Ingest** | Validate and normalize flight data | Continuity checks, timing validation |
| **City Context** | Analyze arrival city and risk factors | Late-night flags, traffic patterns, weather risks |
| **Hotel Sourcing** | Find candidate hotels in target city | Brand filtering, basic constraint pre-screening |
| **Geo/Distance** | Calculate airport-to-hotel travel times | Haversine distance + traffic modeling |
| **Contract Compliance** | Enforce airline contract rules | Rate caps, quality minimums, commute limits |
| **Schedule Optimizer** | Select optimal hotel from compliant options | Multi-factor scoring with tie-breaking |
| **Preference** | Apply crew/airline preferences | Brand weights, amenity scoring |
| **Rate Negotiation** | Identify cost optimization opportunities | Market analysis, corporate rate potential |
| **Audit** | Generate human-readable explanations | Decision summarization, risk identification |

## 🔧 Configuration

### Constraints Example

```json
{
  "maxCommuteMinutes": 30,
  "minHotelRating": 3.8,
  "maxNightlyUsd": 220,
  "preferredBrands": ["Hilton", "Marriott", "Hyatt"],
  "blacklistHotels": [],
  "minRestHours": 10,
  "sameHotelForCrew": true,
  "minReviews": 100,
  "safetyFlags": []
}
```

### Environment Variables

```bash
OPENAI_API_KEY=sk-...           # For future AI agent enhancement
MAPS_API_KEY=...                # Google Maps, HERE, or Mapbox
NODE_ENV=development
PORT=3000
```

## 📊 Scoring Algorithm

Hotels are ranked using a comprehensive scoring system:

- **Proximity Score**: `100 - etaMinutes` (closer = better)
- **Quality Score**: `rating × 10` (higher rating = better)  
- **Cost Score**: `-(nightly ÷ 10)` (lower cost = better)
- **Brand Score**: `+5` if preferred brand
- **Tie Breakers**: Higher review count, then lower rate

## 🔍 Audit & Explainability

Every decision is logged with:
- **Stage**: Which agent made the decision
- **Outcome**: accept/reject/score  
- **Reasons**: Human-readable explanations
- **Details**: Structured data for analysis

Example audit output:
```
Selected Hilton Seattle Airport because: excellent proximity (12min to airport), 
rate $199 within budget, high quality rating (4.2/5), preferred brand (Hilton).
```

## 🚧 Development Roadmap

### v0.1 (Current MVP)
- ✅ Multi-agent pipeline with local JSON data
- ✅ Haversine distance calculations  
- ✅ Basic contract compliance rules
- ✅ Comprehensive audit trails

### v0.2 (Next)
- [ ] Live Google Maps/HERE API integration
- [ ] Real airport database (OpenFlights)
- [ ] Enhanced brand preference modeling
- [ ] Per-role accommodation rules

### v0.3 (Future)
- [ ] OTA rate lookup and booking holds
- [ ] Budget optimization across multi-night stays
- [ ] Union contract rule packs
- [ ] Real-time rate monitoring

### v1.0 (Production)
- [ ] Full legality engine (FAR/EASA rest rules)
- [ ] Payment processing and PNR writeback
- [ ] SOC2 compliance and audit controls
- [ ] Supabase + Render deployment

## 🧪 Testing

```bash
# Run the demo with sample data
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔌 API Integration Points

The system is designed to be API-pluggable:

- **Maps APIs**: Google Maps, HERE, Mapbox
- **Hotel APIs**: Amadeus, Sabre, Booking.com, Expedia
- **Flight Data**: GDS systems, airline APIs
- **Payments**: Stripe, airline corporate accounts

## 📈 Monitoring & Analytics

The system provides comprehensive insights:
- **Decision Analytics**: Success rates by agent and constraint
- **Performance Metrics**: Processing times, cache hit rates
- **Cost Optimization**: Rate negotiation opportunities
- **Compliance Reports**: Constraint violation patterns

## 🛡️ Security & Compliance

- All decisions are auditable with full paper trails
- Configurable constraint enforcement
- Support for airline-specific compliance rules
- Future: SOC2 controls and data encryption

## 🤝 Contributing

Each agent is independent and can be enhanced separately:

1. **Agent Development**: Focus on single-responsibility functions
2. **Service Integration**: Add new APIs through service interfaces  
3. **Constraint Modeling**: Extend the constraints schema
4. **Scoring Enhancement**: Modify the optimization algorithms

## 📚 API Documentation

Coming soon: Full API documentation for integration with existing airline systems and third-party booking platforms.

---

**Built with ❤️ for the aviation industry**