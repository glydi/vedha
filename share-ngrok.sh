#!/bin/bash
echo "Starting Vedha with Ngrok..."

# Kill previous instances if any
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
pkill -f "ngrok http 5173" || true
sleep 2

# Start Backend
echo "Starting Spring Boot..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting React Vite Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Start Ngrok
echo "Starting Ngrok tunnel..."
ngrok http 5173 > /dev/null &
NGROK_PID=$!

trap "echo 'Cleaning up servers...'; kill -9 $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null; exit" SIGINT SIGTERM EXIT

# Wait for ngrok to initialize and grab the dynamic public URL
sleep 5
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*.ngrok-free.app' | head -n 1)
# Fallback search if ngrok-free isn't the assigned domain
if [ -z "$PUBLIC_URL" ]; then
    PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | cut -d'"' -f4 | head -n 1)
fi

echo "$PUBLIC_URL" > current_link.txt

echo "================================================="
echo "Vedha is LIVE and linked!"
echo "Access your full-stack app dynamically anywhere:"
echo ">>>>>>>>>>> $PUBLIC_URL"
echo "(Link also written to current_link.txt)"
echo "================================================="
echo "(Press CTRL+C at any time to stop all servers securely)"

wait
