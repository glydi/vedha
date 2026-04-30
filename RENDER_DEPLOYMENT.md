# Render Deployment Guide

## Overview

Vedha is now configured as a **two-service deployment** on Render:
- **vedha-backend**: Spring Boot REST API (Docker)
- **vedha-frontend**: React Static Site (Static HTML/CSS/JS)

## Architecture

```
┌─────────────────────────────────────────┐
│           Render Platform               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  vedha-frontend                  │   │
│  │  (React Static Site)             │   │
│  │  https://vedha-frontend.onrender │   │
│  └──────────────────────────────────┘   │
│           │                              │
│           ├─ API calls to ──────────┐   │
│                                     │   │
│  ┌──────────────────────────────────┴─┐ │
│  │  vedha-backend                     │ │
│  │  (Spring Boot)                     │ │
│  │  https://vedha-backend.onrender.com
│  │                                    │ │
│  │  Connects to PostgreSQL DB         │ │
│  └────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## Deployment Steps

### 1. Prepare Repository

```bash
# Ensure all files are committed
git add .
git commit -m "Setup two-service deployment for Render"
git push origin main
```

### 2. Create Blueprint on Render

1. Go to https://dashboard.render.com
2. Click **"New"** → **"Blueprint"**
3. Select your GitHub repository
4. Render will automatically read `render.yaml` and create both services

### 3. Configure Environment Variables

After deployment, update these on the **Backend service**:

**CORS_ALLOWED_ORIGINS:**
```
https://vedha-frontend.onrender.com
```

Replace `vedha-frontend` with your actual frontend service name on Render.

## Scripts

### Backend Scripts

**`backend/setup.sh`**
- Checks Java installation
- Validates Maven setup
- Runs automatically on deployment

**`backend/start.sh`**
- Starts Spring Boot application
- Sets Spring profiles (render profile for production)
- Listens on PORT (default 8080)

### Frontend Scripts

**`frontend/setup.sh`**
- Validates Node.js and npm
- Installs npm dependencies with `npm ci`
- Runs automatically on deployment

**`frontend/start.sh`**
- On Render: Confirms build is ready (static files only)
- Locally: Starts Vite dev server on port 5173

## Local Development

### Run Both Services Locally

```bash
# Terminal 1: Backend
cd backend
./start.sh

# Terminal 2: Frontend
cd frontend
./start.sh
```

Backend runs on `http://localhost:8080`
Frontend dev server runs on `http://localhost:5173`

### Or use the unified scripts

```bash
# Terminal 1
./setup.sh
./run.sh
```

## Service URLs

### On Render

- **Frontend**: `https://vedha-frontend.onrender.com`
- **Backend**: `https://vedha-backend.onrender.com`

### Locally

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:8080`

## Database

PostgreSQL credentials are set in `render.yaml` environment variables. The database connection is configured to:

- **Host**: `npvwzgnwprxt.db.dbaas.dev:30731`
- **Database**: `PwKFWx`
- **Username**: `pGYRXxF`
- **Password**: `ZGGAzvC`

⚠️ **Note**: Store credentials securely! Use Render's environment secrets for sensitive data in production.

## Configuration Files

### render.yaml
Main deployment configuration file that defines:
- Service names and types
- Build/start commands
- Environment variables
- Health checks
- Routes and rewrites

### application.properties
Spring Boot configuration (development/default profile)

### application-render.properties
Spring Boot configuration for production on Render

## Troubleshooting

### Backend won't start

1. Check logs: `render.log` service logs in Render dashboard
2. Verify database connection string in environment variables
3. Ensure JWT_SECRET is set
4. Check Spring profiles are correctly activated

### Frontend not loading

1. Check build output in Render logs
2. Verify `vite.config.js` and `package.json` are correct
3. Check API base URL configuration
4. Ensure backend CORS allows frontend origin

### CORS Errors

Update `CORS_ALLOWED_ORIGINS` on backend to include:
```
https://vedha-frontend.onrender.com
```

### Static Files Not Served

Ensure `frontend/dist` directory exists and contains built files. Verify:
```bash
npm run build
ls frontend/dist/
```

## Monitoring

### Health Checks

- **Backend**: Render checks `/actuator/health` endpoint
- **Frontend**: Render checks if static files serve correctly

### View Logs

1. Go to https://dashboard.render.com
2. Select the service
3. Click **"Logs"** tab
4. View real-time logs or download for analysis

## Updates and Redeployment

### Manual Redeploy

1. Make code changes
2. Push to GitHub: `git push origin main`
3. Render automatically rebuilds and redeploys

### Manual Trigger

In Render dashboard:
1. Go to service
2. Click **"Redeploy"** button
3. Select branch and trigger

## Scaling

Render free tier provides:
- 750 hours/month free
- Both services share this quota
- Consider upgrading for production use

## Next Steps

1. ✅ Push repository to GitHub
2. ✅ Create Blueprint on Render
3. ✅ Configure CORS_ALLOWED_ORIGINS
4. ✅ Test both services
5. ✅ Set up CI/CD pipeline (optional)
