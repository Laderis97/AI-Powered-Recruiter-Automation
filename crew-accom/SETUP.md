# Setup Guide - Crew Accommodations Planner

Complete setup guide for the multi-agent crew accommodations planner with Supabase + Render deployment.

## 🎯 Quick Start (Local Development)

```bash
# Clone the repository
git clone <your-repo-url>
cd crew-accom

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run local demo
npm run dev

# Start web server
npm run server
```

Visit `http://localhost:3000` for the interactive dashboard.

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose organization and project name
4. Select region closest to your users
5. Set a strong database password
6. Wait for project initialization (~2 minutes)

### 2. Configure Local Environment

```bash
# Install Supabase CLI globally
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF_HERE

# Copy your project URL and keys
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Run Database Migrations

```bash
# Apply all migrations
supabase db push

# Verify tables were created
supabase sql --db-url="$DATABASE_URL" --file="\\dt"

# Check seed data
supabase sql --db-url="$DATABASE_URL" --file="select * from airlines;"
```

### 4. Deploy Edge Functions

```bash
# Deploy ETA calculation function
supabase functions deploy eta

# Deploy hotel sourcing function  
supabase functions deploy hotel-source

# Test functions
curl -X POST \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/eta" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"pairingId":"test","airportIata":"SEA","hotelIds":["H1"],"window":{"startUtc":"2025-01-15T03:00:00Z","endUtc":"2025-01-15T04:00:00Z"},"mode":"drive"}'
```

## 🌐 Web Application Setup (Render)

### 1. Connect to Render

1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repository
5. Render auto-detects `render.yaml` configuration

### 2. Configure Environment Variables

In Render Dashboard → Your Service → Environment:

```bash
# Required - Supabase
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Required - Application
NODE_ENV=production
DEFAULT_AIRLINE_ID=550e8400-e29b-41d4-a716-446655440000

# Optional - External APIs
OPENAI_API_KEY=sk-your-openai-key-here
MAPS_API_KEY=your-google-maps-key-here

# Optional - Feature Flags
ENABLE_SUPABASE_INTEGRATION=true
ENABLE_LIVE_MAPS_API=false
ENABLE_LIVE_HOTEL_API=false
```

### 3. Deploy Application

```bash
# Auto-deployment triggers on push to main
git push origin main

# Or manually trigger deployment in Render dashboard
```

## 🔄 CI/CD Setup (GitHub Actions)

### 1. Configure Repository Secrets

In GitHub → Your Repository → Settings → Secrets and Variables → Actions:

```bash
# Supabase Secrets
SUPABASE_PROJECT_REF=your_project_ref_here
SUPABASE_ACCESS_TOKEN=your_access_token_here

# Render Secrets  
RENDER_SERVICE_ID=srv-your_service_id_here
RENDER_API_KEY=rnd_your_api_key_here
RENDER_APP_URL=https://your-app.onrender.com
```

### 2. Get Required Keys

**Supabase Access Token**:
1. Go to Supabase Dashboard → Settings → Access Tokens
2. Click **"Generate new token"**
3. Copy the token

**Render API Key**:
1. Go to Render Dashboard → Account Settings → API Keys
2. Click **"Create API Key"**
3. Copy the key

**Render Service ID**:
1. Go to your deployed service in Render
2. Copy the service ID from the URL: `srv-xxxxx`

### 3. Test CI/CD Pipeline

```bash
# Push to main to trigger deployment
git add .
git commit -m "feat: initial deployment setup"
git push origin main

# Monitor in GitHub Actions tab
# Check deployment status in Render dashboard
# Verify health at your deployed URL/health
```

## 🧪 Testing Your Deployment

### 1. Health Checks

```bash
# Test application health
curl https://your-app.onrender.com/health

# Test API endpoints
curl https://your-app.onrender.com/api/pairings
curl https://your-app.onrender.com/api/constraints
```

### 2. End-to-End Planning Test

```bash
# Test full planning pipeline
curl -X POST https://your-app.onrender.com/api/plan-all \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Database Verification

```bash
# Check data in Supabase dashboard
# Go to Table Editor
# Verify airlines, hotels, airports tables have data
# Check decisions table for audit records
```

## 🎛️ Configuration Options

### Airline-Specific Setup

Each airline can have their own:

```sql
-- Custom constraints
INSERT INTO contract_constraints (
  airline_id,
  name,
  max_commute_minutes,
  min_hotel_rating,
  max_nightly_usd,
  preferred_brands
) VALUES (
  'your-airline-uuid',
  'Custom Contract',
  45,
  4.0,
  300,
  ARRAY['Hilton', 'Marriott', 'Hyatt', 'IHG']
);

-- Custom preferences
INSERT INTO preferences (
  airline_id,
  brand_weights,
  amenity_weights
) VALUES (
  'your-airline-uuid',
  '{"Hilton": 10, "Marriott": 8, "Hyatt": 9}',
  '{"Airport Shuttle": 10, "WiFi": 9, "Gym": 6}'
);
```

### Performance Tuning

```bash
# Increase cache TTL for stable routes
CACHE_TTL_MINUTES=120

# Adjust processing timeout for complex routes
MAX_PROCESSING_TIME_MS=45000

# Enable performance metrics collection
ENABLE_PERFORMANCE_METRICS=true
```

## 🎉 You're Ready!

Once setup is complete, you'll have:

- ✅ **Multi-agent planning system** running in production
- ✅ **Scalable PostgreSQL database** with audit trails
- ✅ **Edge functions** for real-time calculations  
- ✅ **Auto-deploying CI/CD pipeline**
- ✅ **Interactive web dashboard**
- ✅ **Comprehensive monitoring** and analytics

Visit your Render URL to see the system in action!

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section in `DEPLOYMENT.md`
2. Review logs in Render and Supabase dashboards
3. Test individual components locally first
4. Verify all environment variables are set correctly

---

**Happy deploying!** 🚁✨