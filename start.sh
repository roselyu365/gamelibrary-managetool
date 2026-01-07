#!/bin/bash

# Gaming Area System - Quick Start Script
# This script sets up and launches the entire gaming catalog and booking system

echo "🎮 Gaming Area Catalog & Booking System"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -q -r requirements.txt
echo "✅ Python dependencies installed"

# Initialize database
echo "🗄️  Initializing database..."
python -c "from app import init_db; init_db()" 2>/dev/null || echo "Database already exists"

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo ""
    echo "📥 Installing frontend dependencies..."
    cd frontend
    npm install --silent
    cd ..
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""
echo "🚀 Starting the Gaming Area System..."
echo ""
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
echo "👨‍💼 Admin Dashboard: http://localhost:3000/admin"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
echo "Starting backend server..."
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for user input
echo "✅ Both servers are running!"
echo ""
wait
