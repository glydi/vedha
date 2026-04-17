#!/bin/bash

# Kill existing processes on port 8080 and 5173 to avoid "Address already in use" errors
echo "Cleaning up existing processes..."
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 2

echo "Starting Backend..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!

echo "Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Trap SIGINT to kill background processes allowing clean exit
trap "echo 'Stopping servers...'; kill -9 $BACKEND_PID 2>/dev/null; kill -9 $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM EXIT

wait $BACKEND_PID $FRONTEND_PID
