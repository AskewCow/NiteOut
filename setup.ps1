# Welcome Message 
Write-Host "---------------------------------" -ForegroundColor DarkBlue
Write-Host "Welcome to NiteOut Installer" -ForegroundColor Magenta
Write-Host "---------------------------------" -ForegroundColor DarkBlue
Start-Sleep -Seconds 2  # Wait for 2 seconds

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
    Write-Host "'pip' is not recognized. Please ensure pip is installed and added to your PATH." -ForegroundColor Red
    Start-Sleep -Seconds 3  # Wait for 3 seconds before exiting
    exit
}
Write-Host "pip is available." -ForegroundColor Yellow

# Check if Node.js is installed
Write-Host "Checking if Node.js is installed..." -ForegroundColor Cyan
try {
    node --version
} catch {
    Write-Host "Node.js is not installed. Please install Node.js and ensure 'npm' works." -ForegroundColor Red
    Start-Sleep -Seconds 3  # Wait for 3 seconds before exiting
    exit
}
Write-Host "Node.js is installed." -ForegroundColor Yellow

# Check if npm is available
Write-Host "Checking if npm is available..." -ForegroundColor Cyan
try {
    npm --version
} catch {
    Write-Host "'npm' is not recognized. Please ensure npm is installed and added to your PATH." -ForegroundColor Red
    Start-Sleep -Seconds 3  # Wait for 3 seconds before exiting
    exit
}
Write-Host "npm is available." -ForegroundColor Yellow

# Check if ngrok is installed
Write-Host "Checking if Ngrok is installed..." -ForegroundColor Cyan
try {
    ngrok version
} catch {
    Write-Host "Ngrok is not installed. Please install Ngrok and ensure it works." -ForegroundColor Red
    Start-Sleep -Seconds 3  # Wait for 3 seconds before exiting
    exit
}
Write-Host "Ngrok is installed." -ForegroundColor Yellow

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
    Write-Host "Backend setup completed." -ForegroundColor Green
} else {
    Write-Host "Failed to navigate to the backend folder." -ForegroundColor Red
    exit
}

# Frontend setup (installing frontend dependencies)
Write-Host "---------------------------------" -ForegroundColor DarkBlue
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
cd ..\frontend\mobile
if ($?) {
    npm install

    # Check for high vulnerabilities and run npm audit fix if necessary
    $auditResult = npm audit --json
    if ($auditResult -match '"severity":"high"') {
        Write-Host "High vulnerabilities detected, running 'npm audit fix'..." -ForegroundColor Red
        npm audit fix
    }

    Write-Host "Frontend setup completed." -ForegroundColor Green
} else {
    Write-Host "Failed to navigate to the frontend folder." -ForegroundColor Red
    exit
}

# Exiting the virtual environment
Write-Host "Exiting virtual environment..." -ForegroundColor Cyan
deactivate

Write-Host "---------------------------------" -ForegroundColor DarkBlue
Write-Host "Project setup is complete!" -ForegroundColor DarkGreen
Start-Sleep -Seconds 3  # Wait before ending
