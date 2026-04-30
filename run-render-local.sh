#!/bin/bash

# run-render-local.sh
# Simulate the Render.com production environment locally in all dimensions.

echo "=========================================================="
echo " Starting Vedha in Render-Simulation Mode (Production) "
echo "=========================================================="

echo "Cleaning up existing processes..."
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
fuser -k 4173/tcp 2>/dev/null || true # default vite preview port
sleep 2

# ----- Backend Configuration -----
echo "Starting Backend with 'render' profile..."
cd backend

# Injecting Render-like environment variables identical to render.yaml
export PORT=8080
export SPRING_PROFILES_ACTIVE=render
export SPRING_DATASOURCE_URL="jdbc:postgresql://npvwzgnwprxt.db.dbaas.dev:30731/PwKFWx"
export SPRING_DATASOURCE_USERNAME="pGYRXxF"
export SPRING_DATASOURCE_PASSWORD="ZGGAzvC"
export JWT_SECRET="this-is-a-very-secure-static-secret-key-for-vedha-01"
export CORS_ALLOWED_ORIGINS="*"

# Compile specifically ensuring production profile
# We use spring-boot:run to bypass packaging if we want, or package & run jar
mvn spring-boot:run -Dspring-boot.run.profiles=render &
BACKEND_PID=$!
cd ..

# ----- Wait for Backend -----
echo "Waiting for the backend API to initialize (this takes ~20 seconds)..."
while ! /bin/bash -c "echo > /dev/tcp/localhost/8080" 2>/dev/null; do
    sleep 2
done
echo "Backend is LIVE!"

# ----- Frontend Configuration -----
echo "Building and Serving Frontend exactly as Render (Static Site)..."
cd frontend

# Set the production API URL for the frontend 
# (if VITE_API_URL is configured in render.yaml, Render injects it during build)
export VITE_API_URL="http://localhost:8080"

# Install dependencies like Render's `buildCommand: npm ci && npm run build`
echo "Running Production Build for Frontend..."
npm install
npm run build

echo "Serving Static Frontend (Simulation)..."
# Using vite preview instead of dev to simulate the static serving
npm run preview &
FRONTEND_PID=$!
cd ..

echo "=========================================================="
echo " Backend PID: $BACKEND_PID (Port 8080)"
echo " Frontend PID: $FRONTEND_PID (Port 4173 - Production Preview)"
echo " Both servers are running exactly as they would on Render!"
echo "=========================================================="

trap "echo 'Stopping servers...'; kill -9 $BACKEND_PID 2>/dev/null; kill -9 $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM EXIT

wait $BACKEND_PID $FRONTEND_PID
