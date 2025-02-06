## Note when Running Project

Frontend dependencies are not included in the repository,
therefore make sure to run (npm i) on command before running project.

## Prerequisites

- Python (preferably latest version).
- NodeJs (preferably latest).
- IDE preferably with a terminal option (for ease of development).
- Expo Go app on your phone (optional but recommended, both laptop and phone need to be on the same network).

## How to Run Backend

### Windows

- Set your cmd directory to the project's "backend" folder.
- Using cmd, run the command (.\venv\Scripts\activate).
- After successfuly activating the virtual environment, run (python main.py).
- This should allow the backend to be emulated on port 5000 (localhost:5000).

### Mac

- Set your terminal directory to the project's "backend" folder.
- Using terminal, run the command (source venv/bin/activate).
- After successfuly activating the virtual environment. run (python3 main.py).
- This should allow the backend to be emulated on port 5000 (localhost:5000).

## How to Run Frontend

### Mac and Windows

- Set your directory to the frontend/mobile file.
- Run the command (npm install).
- Run the command (npm install -g expo-cli).
- Run the command (npx expo start).
- A QR code should appear on the terminal. Scanning should make the frontend appear on your phone.