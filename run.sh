#!/bin/bash
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

wait $BACKEND_PID $FRONTEND_PID
