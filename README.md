# NiteOut

**NiteOut** is a mobile app that helps users find, host, and join pub games in their area. Whether you're looking for a trivia night, a poker game, or a casual darts competition, NiteOut connects you with the best local events.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

-   **Python** (latest version recommended) → [Download here](https://www.python.org/downloads/)
-   **Node.js** (latest LTS version recommended) → [Download here](https://nodejs.org/)
-   **Ngrok** (for exposing the backend, might get flagged as virus) → [Download here](https://ngrok.com/download)
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

```
.\setup.ps1
```

> ⚠️ **Important:** ExecutionPolicy must be enabled to run scripts. To find out how to enable it, head to the troubleshooting section. If you encounter other issues close and reopen Powershell and try again.

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

> **⚠️ Important:** NGROK must be added to System Path variables for this to work. Scroll down to Troubleshooting if you encounter issues!

---

## 🏃‍♀️‍➡️ Running the Project

Once setup is complete, run the following commands, each in **their own** cmd prompt window:

### Backend (Flask)

```sh
cd backend
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
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
API_URL=https://your-ngrok-url.ngrok-free.app/
```

### Frontend (React Native)

```sh
cd frontend/mobile
npx expo start
```

**If expo is not found run:**

```sh
npm install -g expo-cli
```

**Scan the QR code in Expo Go to test on your phone.**

> **⚠️ Important:** Your **laptop and phone** must be on the **same Wi-Fi network** to test the mobile app!

---

## 🛠️ Troubleshooting

### Windows setup file not working

You might encounter the error "running scripts is disabled on this system". To enable running scripts in PowerShell run the following:

```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted -Force
```

> **Note**: You must close/reopen the Powershell console before trying to run the script again

### Setup file stopped working?

-   After running the setup file once make sure to open a new powershell window for it to work

### No module named ...

Make sure you have requirements installed by running this inside the backend folder:

```sh
pip install -r requirements.txt  # or python -m pip install -r requirements.txt
```

### Virtual environment not activating?

Try running:

```sh
source venv/bin/activate  # Mac/Linux
.\venv\Scripts\activate   # Windows
```

### Python/Pip/Ngrok not found even though it's installed?

This is a very common issue on Windows. It is caused when the installation process doesn't update the system's PATH environment variable.
For Python & Pip:

-   If Python is installed using the default settings, it should be found in: C:\Users\YourUsername\AppData\Local\Programs\Python\PythonXX (where XX is the version)

For NGROK:

-   The NGROK.exe will be by default found in your downloads folder. You will need to create a folder somewhere safe that you will be able to access easily.
-   After creating this folder you will need to move the NGROK.exe file from your downloads to this new folder. For example "C:\Program Files\ngrok" where ngrok is the name of the folder and inside is ngrok.exe

Adding to System Path Variables:

-   Open system variables by searching "environment variables" in the windows search and clicking the "Environment Variables..." button.
-   Under System Variables, scroll down and find "Path" and then click edit. Click new and then paste corresponding path to the module you are missing (one new entry per path):

```sh
C:\Users\YourUsername\AppData\Local\Programs\Python\PythonXX\  # When Python is not recognized
C:\Users\YourUsername\AppData\Local\Programs\Python\PythonXX\Scripts\  # When pip is not recognized
C:\Users\YourUsername\YourPathToNgrok\  # When NGROK is not recognized
```

-   Click "OK" to save

### Ngrok error?

-   Ensure your Flask server is running **before** starting Ngrok.

### npm Issues?

Try running the following:

```s
npm cache clean --force
```

### Expo not detecting your device?

-   Make sure your phone and computer are on the same Wi-Fi network.

### Expo not building/Lan Issues?

Try running:

```sh
npx expo start -tunnel
```

### Problem Logging in?

![expoUrl](https://i.imgur.com/bQKN3p9.png)

If you encounter this error message, it typically indicates an issue with your NGROK setup. Here are a few common causes:

-   NGROK was started before running Flask: Ensure that your Flask server is running before starting NGROK.

-   Environments.js not updated with the latest NGROK URL: Make sure you've updated the API_URL in environments.js with the new URL generated by NGROK.

### Just testing?

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
