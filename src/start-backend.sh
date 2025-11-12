#!/bin/bash

# Dorphin Backend Startup Script
# This script starts the local backend server

echo ""
echo "🐬 ================================ 🐬"
echo "   STARTING DORPHIN BACKEND"
echo "🐬 ================================ 🐬"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "📥 Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Navigate to backend directory
cd local-backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "🚀 Starting backend server..."
echo ""
npm start
