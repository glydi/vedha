#!/bin/bash

# local-dev.sh - Start both backend and frontend for local development

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║  Vedha Local Development Setup                 ║"
echo "║  Starting Backend + Frontend                   ║"
echo "╚════════════════════════════════════════════════╝"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check ports
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port already in use (by $service?)${NC}"
        echo "Kill existing process? (y/n)"
        read -r kill_choice
        if [ "$kill_choice" = "y" ]; then
            fuser -k $port/tcp 2>/dev/null || true
            sleep 1
        else
            echo "Cannot proceed with occupied port. Exiting."
            exit 1
        fi
    fi
}

# Kill any existing processes on startup
cleanup() {
    echo -e "${YELLOW}Cleaning up background processes...${NC}"
    fuser -k 8080/tcp 2>/dev/null || true
    fuser -k 5173/tcp 2>/dev/null || true
    sleep 1
}

trap cleanup EXIT

# Clean up before starting
cleanup

# Check ports
check_port 8080 "backend"
check_port 5173 "frontend"

# Create logs directory
mkdir -p logs

# Terminal setup
echo ""
echo -e "${BLUE}Starting services...${NC}"
echo ""

# Start Backend in background
echo -e "${GREEN}[1/2]${NC} Starting Backend (Spring Boot)..."
cd backend
if command -v mvn &> /dev/null; then
    mvn spring-boot:run > ../logs/backend.log 2>&1 &
else
    ./mvnw spring-boot:run > ../logs/backend.log 2>&1 &
fi
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "    Waiting for backend to start..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if nc -z localhost 8080 2>/dev/null; then
        echo -e "    ${GREEN}✓ Backend ready on http://localhost:8080${NC}"
        break
    fi
    sleep 1
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "    ${YELLOW}⚠️  Backend didn't respond. Check logs/backend.log${NC}"
fi

echo ""

# Start Frontend in background
echo -e "${GREEN}[2/2]${NC} Starting Frontend (React + Vite)..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "    Waiting for frontend to start..."
sleep 3
echo -e "    ${GREEN}✓ Frontend dev server on http://localhost:5173${NC}"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ${GREEN}✓ Both services running!${BLUE}                      ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Frontend: ${GREEN}http://localhost:5173${BLUE}              ║${NC}"
echo -e "${BLUE}║  Backend:  ${GREEN}http://localhost:8080${BLUE}              ║${NC}"
echo -e "${BLUE}║  API:      ${GREEN}http://localhost:8080/api${BLUE}           ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Logs:                                         ║${NC}"
echo -e "${BLUE}║  - Backend:  logs/backend.log                  ║${NC}"
echo -e "${BLUE}║  - Frontend: logs/frontend.log                 ║${NC}"
echo -e "${BLUE}║                                                ║${NC}"
echo -e "${BLUE}║  Press Ctrl+C to stop all services             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
