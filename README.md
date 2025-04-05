# NiteOut 

**NiteOut** is a mobile app that helps users find, host, and join pub games in their area. Whether you're looking for a trivia night, a poker game, or a casual darts competition, NiteOut connects you with the best local events.  

---

## Prerequisites  

Before you begin, ensure you have the following installed:  

- **Python** (latest version recommended) → [Download here](https://www.python.org/downloads/)  
- **Node.js** (latest LTS version recommended) → [Download here](https://nodejs.org/)  
- **Expo Go app** (to test the mobile app) → Available on [iOS](https://apps.apple.com/us/app/expo-go/id982107779) & [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)  
- **Ngrok** (for exposing the backend) → [Download here](https://ngrok.com/download)  

> **Important:** Your **laptop and phone** must be on the **same Wi-Fi network** to test the mobile app!  

---

## Quick Setup  

To install everything automatically, **just run one script** in your terminal:  

### MacOS/Linux  
```sh
chmod +x setup.sh  # (Only needed the first time)
./setup.sh
```
### Windows
```sh
setup.bat
```
This will:
- Install all dependencies for backend (Flask) and frontend (React Native).
- Set up a virtual environment for Python.
- Install necessary Node.js modules for React Native.

---
## Setting up NGROK

After running the setup script, you must **manually start Ngrok**:
```sh
ngrok http 8080
```
Copy the generated **Ngrok URL** and update the frontend .env file:
```sh
API_URL=https://your-ngrok-url.ngrok.io
```

---

## Running the Project
Once setup is complete, run the following commands:
### Backend (Flask)
```sh
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```
### Frontend (React Native)
```sh
Copy
Edit
cd frontend
npm start
```
**Scan the QR code in Expo Go to test on your phone.**


## Troubleshooting
### Virtual environment not activating?
Try running:
```sh
source venv/bin/activate  # Mac/Linux  
venv\Scripts\activate     # Windows
```
## Ngrok error?
- Ensure your Flask server is running before starting Ngrok.

## Expo not detecting your device?
- Make sure your phone and computer are on the same Wi-Fi network.



