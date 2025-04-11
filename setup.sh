#!/bin/bash

# Define color variables
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}---------------------------------${NC}"
echo -e "${MAGENTA}Welcome to NiteOut Installer${NC}"
echo -e "${BLUE}---------------------------------${NC}"
echo ""

# Check commands
check_command() {
    local cmd=$1
    local name=$2

    echo -e "${CYAN}Checking if $name is installed...${NC}"
    if ! command -v $cmd &> /dev/null
    then
        echo -e "${RED}$name is not installed. Please install it before proceeding.${NC}"
        sleep 3
        exit 1
    fi
    echo -e "${YELLOW}$name is installed.${NC}"
}

check_command python3 "Python"
check_command pip "pip"
check_command node "Node.js"
check_command npm "npm"
check_command ngrok "Ngrok"

# Check if Expo CLI is installed
echo -e "${CYAN}Checking if Expo CLI is installed...${NC}"
if ! command -v expo &> /dev/null
then
    echo -e "${RED}Expo CLI not found. Installing globally...${NC}"
    npm install -g expo-cli
    echo -e "${YELLOW}Expo CLI installed successfully.${NC}"
else
    echo -e "${GREEN}Expo CLI is installed.${NC}"
fi

echo ""
echo -e "${GREEN}Prerequisite conditions have been met.${NC}"
echo -e "${BLUE}---------------------------------${NC}"
sleep 2

# Backend setup
echo -e "${CYAN}Setting up Python virtual environment...${NC}"
cd backend || { echo -e "${RED}Failed to navigate to backend folder. Exiting...${NC}"; exit 1; }
python3 -m venv venv
echo -e "${GREEN}Virtual environment created.${NC}"
source venv/bin/activate

echo -e "${CYAN}Installing backend requirements...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}Backend setup completed.${NC}"
cd ..

# Frontend setup
echo -e "${BLUE}---------------------------------${NC}"
echo -e "${CYAN}Installing frontend dependencies...${NC}"
cd frontend/mobile || { echo -e "${RED}Failed to navigate to frontend folder. Exiting...${NC}"; exit 1; }
npm install
npm audit fix
echo -e "${GREEN}Frontend setup completed.${NC}"

# Exit virtual environment
echo -e "${BLUE}---------------------------------${NC}"
echo -e "${CYAN}Exiting virtual environment...${NC}"
deactivate

echo ""
echo -e "${GREEN}Project setup is complete!${NC}"
sleep 3
