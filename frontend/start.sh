#!/bin/bash

# frontend/start.sh - Start script for React frontend on Render
# Note: Render serves static files, but for local development, this runs the dev server

set -e

echo "=========================================="
echo "  Starting Frontend - React + Vite"
echo "=========================================="

# For Render static site, the build happens during setup
# Render will serve the built files from frontend/dist

if [ "$RENDER" = "true" ]; then
    echo "✅ Frontend built and ready to serve from dist/"
    echo "Frontend will be served by Render's static site service"
else
    # For local development
    PORT=${PORT:-5173}
    echo "🚀 Starting dev server on http://localhost:$PORT"
    exec npm run dev -- --host 0.0.0.0 --port $PORT
fi
