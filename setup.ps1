# Welcome Message
Write-Host "---------------------------------" -ForegroundColor DarkBlue
Write-Host "Welcome to NiteOut Installer" -ForegroundColor Magenta
Write-Host "---------------------------------" -ForegroundColor DarkBlue
Write-Host "" 

# Check if Python is installed
Write-Host "Checking if Python is installed..." -ForegroundColor Cyan
try {
    python --version
} catch {
    Write-Host "Python is not installed. Please install Python and ensure 'pip' works." -ForegroundColor Red
    Start-Sleep -Seconds 3  # Wait for 3 seconds before exiting
    exit
}
Write-Host "Python is installed." -ForegroundColor Yellow

# Check if pip is available
Write-Host "Checking if pip is available..." -ForegroundColor Cyan
try {
    pip --version
} catch {
    Write-Host "'pip' is not recognized. Please ensure pip is installed and added to your PATH before trying again." -ForegroundColor Red
    Start-Sleep -Seconds 3  # Wait for 3 seconds before exiting
    exit
}
Write-Host "pip is available." -ForegroundColor Yellow

# Check if Node.js is installed
Write-Host "Checking if Node.js is installed..." -ForegroundColor Cyan
try {
    node --version
} catch {
    Write-Host "Node.js is not installed. Please install Node.js and ensure 'npm' works before trying again"  -ForegroundColor Red
    Start-Sleep -Seconds 3  # Wait for 3 seconds before exiting
    exit
}
Write-Host "Node.js is installed." -ForegroundColor Yellow

# Check if npm is available
Write-Host "Checking if npm is available..." -ForegroundColor Cyan
try {
    npm --version
} catch {
    Write-Host "'npm' is not recognized. Please ensure npm is installed and added to your PATH before trying again." -ForegroundColor Red
    Start-Sleep -Seconds 3  # Wait for 3 seconds before exiting
    exit
}
Write-Host "npm is available." -ForegroundColor Yellow

# Check if ngrok is installed
Write-Host "Checking if Ngrok is installed..." -ForegroundColor Cyan
try {
    ngrok version
} catch {
    Write-Host "Ngrok is not installed. Please install Ngrok and ensure it works before trying again." -ForegroundColor Red
    Start-Sleep -Seconds 3  # Wait for 3 seconds before exiting
    exit
}
Write-Host "Ngrok is installed." -ForegroundColor Yellow

# Install Expo CLI if not installed
Write-Host "Checking if Expo CLI is installed..." -ForegroundColor Cyan
try {
    expo --version
    Write-Host "Expo CLI is installed." -ForegroundColor Green  # Message when Expo is found
} catch {
    Write-Host "Expo CLI not found. Installing globally..." -ForegroundColor Red
    npm install -g expo-cli
    Write-Host "Expo CLI installed successfully." -ForegroundColor Yellow
}

Write-Host "" 
Write-Host "Prerequisite conditions have been met." -ForegroundColor Green
Write-Host "---------------------------------" -ForegroundColor DarkBlue
Start-Sleep -Seconds 3  # Wait for 3 seconds before proceeding

# Backend setup (creating and activating the virtual environment)
Write-Host "Setting up Python virtual environment..." -ForegroundColor Cyan
cd backend
if ($?) {
    python -m venv venv
    Write-Host "Virtual environment created successfully." -ForegroundColor Green
    Write-Host "---------------------------------" -ForegroundColor DarkBlue

    # Activate virtual environment
    .\venv\Scripts\Activate

    # Install requirements
    Write-Host "Installing requirements..." -ForegroundColor Cyan
    pip install -r requirements.txt
    Write-Host "" 
    Write-Host "Backend setup completed." -ForegroundColor Green
} else {
    Write-Host "Failed to navigate to the backend folder. Please ensure backend folder exists" -ForegroundColor Red
    exit
}

# Frontend setup (installing frontend dependencies)
Write-Host "---------------------------------" -ForegroundColor DarkBlue
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
cd ..\frontend\mobile
if ($?) {
    # Install all dependencies (if needed) and audit for vulnerabilities
    Write-Host "Running npm install..." -ForegroundColor Cyan
    npm install

    Write-Host "Running npm audit..." -ForegroundColor Cyan
    npm audit fix
    Write-Host "" 
    Write-Host "Frontend setup completed." -ForegroundColor Green
} else {
    Write-Host "Failed to navigate to the frontend folder. Please ensure frontend folder exists" -ForegroundColor Red
    exit
}

Write-Host "---------------------------------" -ForegroundColor DarkBlue
# Exiting the virtual environment
Write-Host "Exiting virtual environment..." -ForegroundColor Cyan
deactivate

Write-Host "" 
Write-Host "Project setup is complete!" -ForegroundColor DarkGreen
Start-Sleep -Seconds 3  # Wait before ending
