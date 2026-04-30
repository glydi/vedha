#!/bin/bash

# Kill existing processes on port 8080 and 5173 to avoid "Address already in use" errors
echo "Cleaning up existing processes..."
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 2

echo "Starting Backend..."
cd backend
# Using mvn instead of ./mvnw to match user's local Maven installation
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start (this takes ~20 seconds)..."
while ! /bin/bash -c "echo > /dev/tcp/localhost/8080" 2>/dev/null; do
    sleep 2
done
echo "Backend is up on port 8080!"

echo "Starting Frontend..."
cd frontend
# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Trap SIGINT to kill background processes allowing clean exit
trap "echo 'Stopping servers...'; kill -9 $BACKEND_PID 2>/dev/null; kill -9 $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM EXIT

wait $BACKEND_PID $FRONTEND_PID
