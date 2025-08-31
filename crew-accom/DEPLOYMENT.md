# Deployment Guide - Crew Accommodations Planner

This guide walks you through deploying the Crew Accommodations Planner to production using **Supabase** (database + edge functions) and **Render** (web application).

## 🏗️ Architecture Overview

```
GitHub → GitHub Actions → Supabase + Render
   ↓           ↓              ↓        ↓
  Code    CI/CD Pipeline   Database   Web App
```

- **GitHub**: Source code repository
- **GitHub Actions**: Automated CI/CD pipeline
- **Supabase**: PostgreSQL database + Edge Functions + Auth
- **Render**: Web application hosting + auto-scaling

## 🚀 Quick Deployment

### 1. Supabase Setup

1. **Create Supabase Project**
   ```bash
   # Visit https://supabase.com/dashboard
   # Click "New Project"
   # Note your project URL and keys
   ```

2. **Install Supabase CLI**
   ```bash
   npm install -g @supabase/cli
   supabase login
   ```

3. **Link to your project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Run migrations**
   ```bash
   supabase db push
   ```

5. **Deploy Edge Functions**
   ```bash
   supabase functions deploy eta
   supabase functions deploy hotel-source
   ```

### 2. Render Setup

1. **Create Render Account**
   - Visit https://render.com
   - Connect your GitHub account

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect this repository
   - Render will auto-detect the `render.yaml` config

3. **Configure Environment Variables**
   ```bash
   # In Render Dashboard → Environment
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   OPENAI_API_KEY=sk-your-openai-key-here
   MAPS_API_KEY=your-google-maps-key-here
   DEFAULT_AIRLINE_ID=550e8400-e29b-41d4-a716-446655440000
   ```

### 3. GitHub Actions Setup

Add these secrets to your GitHub repository:

```bash
# Repository Settings → Secrets and Variables → Actions

# Supabase
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_ACCESS_TOKEN=your-access-token

# Render
RENDER_SERVICE_ID=your-service-id
RENDER_API_KEY=your-api-key
RENDER_APP_URL=https://your-app.onrender.com
```

## 📋 Detailed Setup Steps

### Supabase Configuration

1. **Get your project details**:
   ```bash
   supabase projects list
   ```

2. **Set up environment variables**:
   ```bash
   # Get these from Supabase Dashboard → Settings → API
   SUPABASE_URL=https://abcdefgh.supabase.co
   SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
   ```

3. **Verify database setup**:
   ```bash
   # Check tables are created
   supabase db pull
   
   # Verify seed data
   supabase sql --db-url="$DATABASE_URL" --file="select count(*) from hotels;"
   ```

### Render Configuration

1. **Service Configuration**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:server`
   - **Health Check**: `/health`

2. **Auto-Deploy**:
   - Enabled from `main` branch
   - Deploys on every push to main

3. **Scaling**:
   - Min Instances: 1
   - Max Instances: 3
   - Auto-scaling based on CPU/memory

### API Integration Points

The deployment supports multiple integration modes:

#### Development Mode (Local)
```bash
ENABLE_SUPABASE_INTEGRATION=false
ENABLE_LIVE_MAPS_API=false
ENABLE_LIVE_HOTEL_API=false
```
- Uses local JSON sample data
- Haversine distance calculations
- In-memory caching

#### Staging Mode (Hybrid)
```bash
ENABLE_SUPABASE_INTEGRATION=true
ENABLE_LIVE_MAPS_API=false
ENABLE_LIVE_HOTEL_API=false
```
- Supabase database and edge functions
- Cached travel times
- Static hotel data with dynamic constraints

#### Production Mode (Full Integration)
```bash
ENABLE_SUPABASE_INTEGRATION=true
ENABLE_LIVE_MAPS_API=true
ENABLE_LIVE_HOTEL_API=true
```
- Full Supabase integration
- Live Google Maps API for ETAs
- Live hotel booking APIs (Amadeus, Booking.com)

## 🔐 Security Configuration

### Row Level Security (RLS)

The database uses multi-tenant RLS policies:

```sql
-- Each airline can only see their own data
create policy "airline_isolation" on public.hotels for all
  using (auth.jwt() ->> 'airline_id' = airline_id::text);
```

### API Security

1. **Environment Secrets**: All sensitive keys stored in environment variables
2. **CORS Configuration**: Restricted origins in production
3. **Request Validation**: Zod schemas validate all inputs
4. **Audit Logging**: All decisions tracked with full paper trails

## 📊 Monitoring & Analytics

### Application Metrics

Available at `/health`:
```json
{
  "status": "healthy",
  "services": {
    "supabase": { "status": "healthy", "latency": 45 }
  },
  "features": {
    "supabaseIntegration": true,
    "liveMapsAPI": false
  }
}
```

### Database Analytics

Built-in views for monitoring:
- `planning_success_rates` - Success rates by airline
- `hotel_utilization` - Hotel booking patterns  
- `decision_analysis` - Agent performance metrics

### Render Metrics

Automatic monitoring includes:
- Response times
- Error rates  
- Memory usage
- Deployment history

## 🚨 Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   ```bash
   # Check environment variables
   echo $SUPABASE_URL
   echo $SUPABASE_ANON_KEY
   
   # Test connection
   curl -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/airlines"
   ```

2. **Render Build Failures**
   ```bash
   # Check build logs in Render dashboard
   # Verify package.json scripts
   # Ensure TypeScript compiles locally
   npm run build
   ```

3. **Edge Function Errors**
   ```bash
   # Check function logs in Supabase dashboard
   # Test functions locally
   supabase functions serve eta
   ```

### Health Check Endpoints

- `/health` - Overall service health
- `/api/pairings` - Data access test
- `/api/constraints` - Configuration test

### Log Monitoring

```bash
# Render logs (real-time)
render logs --follow

# Supabase function logs
supabase functions logs eta
supabase functions logs hotel-source
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Build & Test** - Validates TypeScript and runs tests
2. **Deploy Supabase** - Updates edge functions and migrations
3. **Deploy Render** - Builds and deploys web application
4. **Health Check** - Verifies deployment success
5. **Notify** - Reports success/failure status

### Manual Deployment

If needed, you can deploy manually:

```bash
# Deploy to Render
git push origin main  # Triggers auto-deploy

# Deploy Supabase functions only
supabase functions deploy eta
supabase functions deploy hotel-source

# Run database migrations only
supabase db push
```

## 🔧 Configuration Management

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (bypasses RLS) |
| `OPENAI_API_KEY` | No | For future AI enhancements |
| `MAPS_API_KEY` | No | Google Maps/HERE API |
| `DEFAULT_AIRLINE_ID` | No | Default airline for demos |

### Feature Flags

Control which integrations are active:

- `ENABLE_SUPABASE_INTEGRATION` - Use Supabase vs local data
- `ENABLE_LIVE_MAPS_API` - Live maps vs haversine calculation  
- `ENABLE_LIVE_HOTEL_API` - Live hotel APIs vs static data
- `ENABLE_AUDIT_LOGGING` - Database audit vs console only

## 📈 Scaling Considerations

### Database Scaling
- Supabase auto-scales PostgreSQL
- Consider read replicas for high traffic
- Connection pooling handled automatically

### Application Scaling  
- Render auto-scales 1-3 instances
- Stateless agents support horizontal scaling
- Consider Redis for distributed caching

### Edge Function Scaling
- Supabase Edge Functions auto-scale
- Consider caching travel times for 24h+ TTL
- Rate limiting for external API calls

## 🛡️ Security Checklist

- [ ] Environment variables secured
- [ ] Supabase RLS policies tested
- [ ] CORS origins restricted in production  
- [ ] API rate limiting configured
- [ ] Audit logging enabled
- [ ] Secret rotation strategy defined

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Ready to deploy!** 🚀

After setup, your crew accommodations planner will be live with:
- Scalable multi-tenant database
- Real-time edge functions
- Automated CI/CD pipeline
- Comprehensive monitoring & analytics