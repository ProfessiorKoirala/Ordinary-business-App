<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3f0ba7d8-7c03-4118-b4e6-b96e56512d21

## Run Locally

**Prerequisites:**  Node.js 22

1. Install dependencies:
   `npm install`
2. Set environment variables in `.env` (refer to `.env.example`):
   - `GEMINI_API_KEY` (optional, for AI features)
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (for cloud sync)
   - `VITE_GOOGLE_CLIENT_ID` (for Google sign-in)
3. Run the app:
   `npm run dev`

---

## Deploy to Google Cloud

### Option 1: Google Cloud Run (Recommended)

1. **Deploy directly with gcloud CLI:**
   ```bash
   gcloud run deploy ob-pro \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production
   ```

2. **Or submit via Google Cloud Build:**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

### Option 2: Google App Engine

Deploy using the included `app.yaml`:
```bash
gcloud app deploy app.yaml
```

### Health Check Endpoints
- `GET /health` (Returns 200 OK for Google Cloud load balancers and container probes)
- `GET /api/health` (Returns JSON with uptime)
