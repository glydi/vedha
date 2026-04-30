#!/bin/bash

# backend/setup.sh - Setup script for Spring Boot backend on Render

set -e

echo "=========================================="
echo "  Backend Setup - Spring Boot"
echo "=========================================="

# Check if running on Render
if [ "$RENDER" = "true" ]; then
    echo "✅ Running on Render platform"
fi

# Check Java availability
if ! command -v java &> /dev/null; then
    echo "❌ Java not found! Installing OpenJDK 21..."
    apt-get update && apt-get install -y openjdk-21-jdk-headless
    echo "✅ Java installed"
else
    java_version=$(java -version 2>&1 | head -n 1)
    echo "✅ Java found: $java_version"
fi

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo "Using Maven wrapper (mvnw)"
    chmod +x ./mvnw
else
    echo "✅ Maven found: $(mvn -v | head -n 1)"
fi

echo "✅ Backend setup complete"
