#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Code Snippet Manager Setup..."

# 0. Kill previous instances
echo "🧹 Cleaning up previous instances..."
fuser -k 8080/tcp 5173/tcp 2>/dev/null || true
sleep 1

# 1. Start Database (PostgreSQL via Docker or fallback to H2)
if command -v docker-compose &> /dev/null; then
    echo "📡 Starting PostgreSQL via Docker Compose..."
    docker-compose up -d
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "📡 Starting PostgreSQL via Docker Compose..."
    docker compose up -d
else
    echo "⚠️ Docker not found. Using H2 In-Memory database for this session."
    echo "💡 Note: To use PostgreSQL, please install Docker and ensure it's running."
fi

# 2. Run Backend
echo "☕ Starting Spring Boot Backend..."
cd backend
mvn spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend starting in background (PID: $BACKEND_PID)..."
cd ..

# 3. Run Frontend
echo "⚛️ Starting Vite Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend starting in background (PID: $FRONTEND_PID)..."
cd ..

echo "-------------------------------------------------------"
echo "🎉 Application is starting up!"
echo "📡 Backend: http://localhost:8080"
echo "🌐 Frontend: http://localhost:5173"
echo "📊 H2 Console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:snippet_db)"
echo ""
echo "📝 Logs are being written to backend.log and frontend.log"
echo "To stop the application, use: kill $BACKEND_PID $FRONTEND_PID"
echo "-------------------------------------------------------"

# Keep script running to allow user to see output
wait
