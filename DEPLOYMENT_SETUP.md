# Two-Service Deployment Summary

## What Was Created

### 1. **Backend Service Scripts**

**`backend/setup.sh`**
- Validates Java installation
- Checks Maven availability  
- Prepares environment for Spring Boot

**`backend/start.sh`**
- Starts Spring Boot application
- Automatically detects Render environment
- Activates appropriate Spring profiles
- Listens on configurable PORT

### 2. **Frontend Service Scripts**

**`frontend/setup.sh`**
- Validates Node.js and npm
- Installs npm dependencies with `npm ci`
- Prepares React build environment

**`frontend/start.sh`**
- On Render: Confirms static build is ready
- Locally: Starts Vite dev server

### 3. **Local Development**

**`local-dev.sh`**
- Starts both services automatically
- Cleans up any existing processes
- Shows real-time status and logs
- Useful for local testing

### 4. **Updated Configuration**

**`render.yaml`**
- Configured two separate services (backend + frontend)
- Backend: Docker-based Spring Boot
- Frontend: Static React build
- Environment variables for production
- Health checks and routing rules

**`RENDER_DEPLOYMENT.md`**
- Complete deployment guide
- Architecture diagram
- Step-by-step deployment instructions
- Troubleshooting guide
- Configuration reference

## Service Architecture

```
┌─── Render Platform ──────────────────┐
│                                      │
│  Frontend Service (Static)           │
│  - Serves React SPA                  │
│  - URL: vedha-frontend.onrender.com  │
│  - Rewrites /api/* to backend        │
│                                      │
│  Backend Service (Docker)            │
│  - Spring Boot REST API              │
│  - URL: vedha-backend.onrender.com   │
│  - Connects to PostgreSQL            │
│                                      │
└──────────────────────────────────────┘
```

## Usage

### Local Development (Recommended)
```bash
./local-dev.sh
```
- Starts both services
- Shows status and logs
- Easy cleanup

### Individual Services
```bash
# Backend only
cd backend && ./start.sh

# Frontend only  
cd frontend && npm run dev
```

### Manual Setup
```bash
./backend/setup.sh
./frontend/setup.sh
./backend/start.sh    # Terminal 1
./frontend/start.sh   # Terminal 2
```

## Deployment

1. Push to GitHub
2. Create Blueprint on Render dashboard
3. Render automatically:
   - Runs setup scripts
   - Builds each service
   - Starts services
   - Configures networking

## Environment Configuration

### Backend Environment Variables
- `PORT`: Service port (default 8080)
- `SPRING_DATASOURCE_URL`: Database connection
- `SPRING_DATASOURCE_USERNAME`: DB user
- `SPRING_DATASOURCE_PASSWORD`: DB password
- `JWT_SECRET`: Generated automatically
- `CORS_ALLOWED_ORIGINS`: Frontend URL

### Frontend Environment Variables
- `VITE_API_BASE_URL`: Backend API URL

## Key Changes from Monolith Setup

| Aspect | Before | After |
|--------|--------|-------|
| Services | Single combined | Backend + Frontend (2) |
| Backend Runtime | Spring Boot Native | Docker |
| Frontend Runtime | Served by backend | Static site |
| Build Process | Single Maven build | Separate builds |
| Deployment | One service | Two services |
| Scaling | Limited | Independent scaling |

## File Structure

```
vedha/
├── backend/
│   ├── setup.sh          ← NEW: Backend setup
│   ├── start.sh          ← NEW: Backend start
│   ├── src/
│   ├── pom.xml           (updated)
│   └── Dockerfile
│
├── frontend/
│   ├── setup.sh          ← NEW: Frontend setup
│   ├── start.sh          ← NEW: Frontend start
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── render.yaml           (updated for two services)
├── local-dev.sh          ← NEW: Local dev convenience script
├── RENDER_DEPLOYMENT.md  ← NEW: Complete deployment guide
├── DEPLOYMENT_SETUP.md   ← This file
├── setup.sh              (kept for reference)
└── run.sh                (kept for reference)
```

## Next Steps

1. ✅ Test locally: `./local-dev.sh`
2. ✅ Verify both services start
3. ✅ Test API endpoints
4. ✅ Push to GitHub
5. ✅ Deploy on Render using Blueprint
6. ✅ Configure CORS_ALLOWED_ORIGINS
7. ✅ Test production deployment

## Troubleshooting

**Port Already in Use:**
```bash
fuser -k 8080/tcp  # Kill backend port
fuser -k 5173/tcp  # Kill frontend port
```

**Backend Won't Connect to Database:**
- Check database credentials in render.yaml
- Verify network connectivity
- Check Render logs

**Frontend Won't Load:**
- Check npm installation
- Verify vite.config.js
- Check build output in logs/frontend.log

**CORS Errors:**
- Update CORS_ALLOWED_ORIGINS on backend
- Restart backend service

## Support

See `RENDER_DEPLOYMENT.md` for:
- Detailed architecture
- Complete deployment steps
- Full troubleshooting guide
- Monitoring instructions
