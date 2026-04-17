#!/bin/bash

echo "Stopping Tech Vault - Code Snippet Manager..."

# Kill Backend (typically on port 8080)
BE_PORT=8080
BE_PID=$(lsof -t -i:$BE_PORT)
if [ -n "$BE_PID" ]; then
    echo "Stopping Backend (Port $BE_PORT, PID $BE_PID)..."
    kill $BE_PID
else
    echo "Backend is not running on port $BE_PORT."
fi

# Kill Frontend (typically on port 5173)
FE_PORT=5173
FE_PID=$(lsof -t -i:$FE_PORT)
if [ -n "$FE_PID" ]; then
    echo "Stopping Frontend (Port $FE_PORT, PID $FE_PID)..."
    kill $FE_PID
else
    echo "Frontend is not running on port $FE_PORT."
fi

# Cleanup any orphaned mvnw or vite processes if needed
# pkill -f "spring-boot:run"
# pkill -f "vite"

echo "All processes stopped."
