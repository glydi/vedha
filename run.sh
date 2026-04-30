#!/bin/bash

# If Java isn't natively available, check if setup.sh downloaded it (Render Polyfill)
if ! command -v java &> /dev/null; then
    JDK_DIR=$(find . -maxdepth 1 -type d -name "jdk-21*" | head -n 1)
    if [ -n "$JDK_DIR" ]; then
        export JAVA_HOME="$PWD/${JDK_DIR#./}"
        export PATH="$JAVA_HOME/bin:$PATH"
    fi
fi

# Kill existing processes on port 8080 and 5173 to avoid "Address already in use" errors
echo "Cleaning up existing processes..."
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 2

echo "Starting Backend..."
cd backend
if [ "$RENDER" = "true" ] || [ -n "$RENDER_SERVICE_ID" ]; then
    echo "☁️ Render environment detected! Activating 'render' spring profile."
    PROFILE_FLAG="-Dspring-boot.run.profiles=render"
else
    PROFILE_FLAG=""
fi

if command -v mvn &> /dev/null; then
    mvn spring-boot:run $PROFILE_FLAG &
else
    ./mvnw spring-boot:run $PROFILE_FLAG &
fi
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start (this takes ~20 seconds)..."
while ! /bin/bash -c "echo > /dev/tcp/localhost/8080" 2>/dev/null; do
    sleep 2
done
echo "Backend is up on port 8080!"

# Wait for the single backend server to serve both API and static Frontend indefinitely
echo "Backend is serving the fullstack app natively on port 8080 (or \$PORT)."
wait $BACKEND_PID
