# NiteOut

**NiteOut** is a mobile app that helps users find, host, and join pub games in their area. Whether you're looking for a trivia night, a poker game, or a casual darts competition, NiteOut connects you with the best local events.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

-   **Python** (latest version recommended) → [Download here](https://www.python.org/downloads/)
-   **Node.js** (latest LTS version recommended) → [Download here](https://nodejs.org/)
-   **Ngrok** (for exposing the backend) → [Download here](https://ngrok.com/download)
-   **Expo Go app** (to test the mobile app) → Available on [iOS](https://apps.apple.com/us/app/expo-go/id982107779)

> ⚠️ **Important:** This project currently supports **iOS only**. You need either an iPhone or Xcode Simulator (macOS).

---

## ⚡ Quick Setup

To install everything automatically:

### On macOS/Linux:

```sh
chmod +x setup.sh  # Only once
./setup.sh
```

### Windows

Open the project directory in **Windows Powershell**

```sh
.\setup.ps1
```

This will:

-   Install all dependencies for backend (Flask) and frontend (React Native).
-   Set up a virtual environment for Python.
-   Install necessary Node.js modules for React Native.

---

## ⚙️ Setting up NGROK

Sign up for [NGROK](https://dashboard.ngrok.com/get-started/your-authtoken). You will receive your own [Auth Token](https://dashboard.ngrok.com/get-started/your-authtoken). Once done, run the following in cmd prompt:

```sh
ngrok config add-authtoken YOUR_TOKEN_HERE
```

---

## 🏃‍♀️‍➡️ Running the Project

Once setup is complete, run the following commands, each in their own cmd prompt window:

### Backend (Flask)

```sh
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

### NGROK

```sh
ngrok http 8080
```

Copy the generated **Ngrok URL** and update the frontend/mobile/environment.js file:

![NGROK URL](https://i.imgur.com/XOGls3i.jpeg)

Inside environments.js:

```sh
API_URL=https://your-ngrok-url.ngrok.io
```

### Frontend (React Native)

```sh
cd frontend/mobile
npx expo start
```

**Scan the QR code in Expo Go to test on your phone.**

> **⚠️ Important:** Your **laptop and phone** must be on the **same Wi-Fi network** to test the mobile app!

---

## 🛠️ Troubleshooting

### Virtual environment not activating?

Try running:

```sh
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
```

## Ngrok error?

-   Ensure your Flask server is running before starting Ngrok.

## Expo not detecting your device?

-   Make sure your phone and computer are on the same Wi-Fi network.

## Expo not building/Lan Issues?

Try running:

```sh
npx expo start -tunnel
```

## No module named ...

Make sure you have requirements installed by running this inside the backend folder:

```sh
pip install -r requirements.txt  # or python -m pip install -r requirements.txt
```

## Just testing?

Log into our app using these test credentials:

For gamer account:

```
email: test@gmail.com
password: test@123
```

For publican account:

```
email: bar@gmail.com
password: test@123
```
