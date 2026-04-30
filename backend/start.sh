#!/bin/bash

# backend/start.sh - Start script for Spring Boot backend on Render

set -e

echo "=========================================="
echo "  Starting Backend - Spring Boot"
echo "=========================================="

# Set port (Render provides PORT env var)
PORT=${PORT:-8080}
echo "🚀 Starting backend on port $PORT"

# Set Spring profiles
PROFILES="default"
if [ "$RENDER" = "true" ]; then
    echo "☁️  Render environment detected, activating 'render' profile"
    PROFILES="render"
fi

# Run Maven
if command -v mvn &> /dev/null; then
    exec mvn spring-boot:run \
        -Dspring-boot.run.jvmArguments="-Dserver.port=$PORT" \
        -Dspring-boot.run.profiles=$PROFILES
else
    exec ./mvnw spring-boot:run \
        -Dspring-boot.run.jvmArguments="-Dserver.port=$PORT" \
        -Dspring-boot.run.profiles=$PROFILES
fi
