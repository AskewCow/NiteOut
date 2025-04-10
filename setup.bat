@echo off
setlocal enabledelayedexpansion

:: Function to display in red color
:RED
echo ^<^[[31m%~1^>^
goto :EOF

:: Function to display in green color
:GREEN
echo ^<^[[32m%~1^>^
goto :EOF

:: Function to display in purple color
:PURPLE
echo ^<^[[35m%~1^>
goto :EOF

:: Check if Python is installed
echo Checking if Python is installed...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    call :RED "Python is not installed. Please install Python and ensure 'pip' works (add Python to the PATH)."
    pause
    exit /b
)
echo Python is installed.

:: Check if pip is available
echo Checking if pip is available...
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    call :RED "'pip' is not recognized. Please ensure pip is installed and added to your PATH."
    pause
    exit /b
)
echo pip is available.

:: Check if Node.js is installed
echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    call :RED "Node.js is not installed. Please install Node.js and ensure 'npm' works."
    pause
    exit /b
)
echo Node.js is installed.

:: Check if npm is available
echo Checking if npm is available...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    call :RED "'npm' is not recognized. Please ensure npm is installed and added to your PATH."
    pause
    exit /b
)
echo npm is available.

:: Check if ngrok is installed
echo Checking if Ngrok is installed...
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    call :RED "Ngrok is not installed. Please install Ngrok and ensure it works."
    pause
    exit /b
)
echo Ngrok is installed.

:: Prerequisites met
call :GREEN "Prerequisite conditions have been met."

:: Backend setup
call :PURPLE "Setting up Python virtual environment..."
cd backend || exit
python -m venv venv
call :GREEN "Backend setup completed."

:: Activate the virtual environment and install requirements
cd backend || exit
call :PURPLE "Setting up Python virtual environment..."
venv\Scripts\activate
pip install -r requirements.txt

:: Frontend setup
call :PURPLE "Installing frontend dependencies..."
cd ..\frontend\mobile || exit
npm install

:: Final confirmation
call :GREEN "Frontend setup completed."
call :GREEN "Project setup is complete!"
pause
