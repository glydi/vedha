#!/bin/bash

# frontend/setup.sh - Setup script for React frontend on Render

set -e

echo "=========================================="
echo "  Frontend Setup - React + Vite"
echo "=========================================="

# Check if running on Render
if [ "$RENDER" = "true" ]; then
    echo "✅ Running on Render platform"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    exit 1
else
    echo "✅ Node.js found: $(node -v)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found!"
    exit 1
else
    echo "✅ npm found: $(npm -v)"
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm ci

echo "✅ Frontend setup complete"
