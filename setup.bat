@echo off
echo Setting up the project (Windows)...

REM Backend Setup
cd backend
echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

REM Frontend Setup
cd frontend/mobile
echo Installing frontend dependencies...
npm install
cd ..

echo Setup complete! Follow these steps to run the project:
echo 1️⃣ Start backend: cd backend && venv\Scripts\activate && python app.py
echo 2️⃣ Expose backend: ngrok http 5000
echo 3️⃣ Start frontend: cd frontend && expo start
pause
