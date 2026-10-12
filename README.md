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
   - `VITE_GOOGLE_CLIENT_ID` (Google OAuth Client ID with Drive access)
   - `GEMINI_API_KEY` (optional, for Leo AI Assistant)
3. Run the app:
   `npm run dev`

---

## Architecture & Storage
- **Google Drive Storage**: All user data (orders, inventory, expenses, staff, etc.) is saved directly to and loaded from `obProData.xlsx` in the authenticated user's personal Google Drive.
- **Local Fallback**: Full offline functionality via local browser storage.
- **Zero Third-Party Databases**: No Supabase, no Firebase, and no backend database. The server purely serves the static app assets and health checks.

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
