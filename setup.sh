#!/bin/bash
echo "Setting up the project (macOS/Linux)..."

# Backend Setup
echo "Setting up Python virtual environment..."
cd backend || exit
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend Setup
echo "Installing frontend dependencies..."
cd ../frontend || exit
npm install

echo "Setup complete! Run the following to start the project:"
echo "1️⃣ Start backend: cd backend && source venv/bin/activate && python app.py"
echo "2️⃣ Expose backend: ngrok http 8080"
echo "3️⃣ Start frontend: cd frontend && expo start"
