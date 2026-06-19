# Deployment Guide for SolarSail

## Prerequisites
- Google Cloud Project
- MongoDB Atlas account
- Vercel account (for frontend)
- Google OAuth 2.0 credentials

## Backend Deployment (Google Cloud Run)

### 1. Set Up Google Cloud Project
```bash
gcloud projects create solarsail-prod --name="SolarSail Production"
gcloud config set project solarsail-prod
```

### 2. Enable Required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 3. Create MongoDB Atlas Connection
1. Go to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Create database user
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/solarsail`

### 4. Set Up Cloud Run Environment Variables
```bash
gcloud run deploy solarsail-server \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars \
    MONGODB_URI=mongodb+srv://...,\
    JWT_SECRET=your_secret_key,\
    GEMINI_API_KEY=your_api_key,\
    GOOGLE_CLIENT_ID=your_client_id,\
    CLIENT_URL=https://your-vercel-url.vercel.app,\
    NODE_ENV=production
```

### 5. Alternative: Using Cloud Build
```bash
# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Create build trigger
gcloud builds submit --config=cloudbuild.yaml

# Or set up automatic trigger on GitHub push
# In Cloud Console: Cloud Build > Triggers > Create Trigger
```

## Frontend Deployment (Vercel)

### 1. Connect GitHub Repository
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository

### 2. Configure Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `./client`

### 3. Set Environment Variables in Vercel
```
VITE_API_URL=https://solarsail-server-xxxxx.run.app/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 4. Deploy
Click "Deploy" and wait for completion.

## Post-Deployment Verification

### 1. Test Backend Health
```bash
curl https://solarsail-server-xxxxx.run.app/health
# Should return: {"status":"ok",...}
```

### 2. Test Authentication Endpoint
```bash
curl -X POST https://solarsail-server-xxxxx.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

### 3. Test Frontend Loading
Visit: https://solarsail-xxxxx.vercel.app

### 4. Check Logs
```bash
# Cloud Run logs
gcloud run logs read solarsail-server --region us-central1 --limit 50

# Vercel logs
# Check in Vercel dashboard under Deployments > Logs
```

## Monitoring & Maintenance

### Set Up Monitoring
```bash
# Create Cloud Monitoring dashboard
gcloud monitoring dashboards create --config-from-file=dashboard.yaml
```

### Set Up Alerting
```bash
# Alert on high error rate
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate"
```

### Database Backups
1. MongoDB Atlas: Enable automated backups (default)
2. Backup frequency: Daily
3. Retention: 35 days (default)

## Troubleshooting

### 502 Bad Gateway
- Check backend logs: `gcloud run logs read solarsail-server`
- Verify MongoDB connection
- Check environment variables are set

### CORS Errors
- Verify `CLIENT_URL` is correct in backend env vars
- Check `corsConfig` in `server/src/middleware/security.js`

### Slow API Response
- Check MongoDB indexes
- Monitor Cloud Run CPU/memory usage
- Consider increasing instance count

## Rollback Procedure

### Revert to Previous Version
```bash
# List revisions
gcloud run revisions list --service=solarsail-server

# Deploy previous revision
gcloud run deploy solarsail-server \
  --image=gcr.io/PROJECT_ID/solarsail-server:OLD_SHA
```

## Cost Optimization

1. **Cloud Run**: First 2M requests/month free
2. **MongoDB**: M0 free tier for testing (512MB)
3. **Vercel**: Free tier suitable for most projects

Typical monthly cost:
- Cloud Run: $2-5
- MongoDB: $0 (M0) or $57+ (M2)
- Vercel: $0
- Total: $2-62/month

## Security Checklist

- [ ] All environment variables set
- [ ] SSL/TLS enabled (automatic with Cloud Run)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Database authentication strong passwords
- [ ] MongoDB IP allowlist configured
- [ ] Regular security updates applied
