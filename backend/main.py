from flask import Flask, request, jsonify, send_from_directory
from flask_apscheduler import APScheduler
from Gamer import Gamer
from Publican import Publican
from game import Game, SeatBasedGame, TableBasedGame
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from firebase_admin import credentials, firestore, storage, initialize_app

import os
import time
import firebase_admin

class Config:
    SCHEDULER_API_ENABLED = True

# Initialize Flask App
app = Flask(__name__)
app.config.from_object(Config())
app.config['UPLOAD_FOLDER'] = 'backend/assets'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()


if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    default_app = initialize_app(cred, {
        'storageBucket': 'niteout-storage-49dc5'
    })
else:
    default_app = firebase_admin.get_app()

bucket = storage.bucket('niteout-storage-49dc5', app=default_app)
db_firestore = firestore.client(app=default_app)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)



# Define a function to perform the refresh
def refresh_data():
    # Include logic to refresh or update data here
    print("Data refreshed at interval")

# Schedule the function to run every 10 minutes
scheduler.add_job(id='Scheduled Task', func=refresh_data, trigger='interval', minutes=30)


"""
Summary: 
    API "GET" call to get all gamer data from firebase

Returns:
    .JSON + HTTP Status: Returns a .JSON file with the specified
    data of all gamers and HTTP status 200 if successful
"""


@app.route("/gamer_login", methods=["POST"])
def gamer_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    gamers_ref = db_firestore.collection("gamers")
    query = gamers_ref.where("email", "==", email).stream()

    gamer_doc = next(query, None)

    if not gamer_doc:
        return jsonify({"error": "User not found"}), 404

    gamer_data = gamer_doc.to_dict()

    if gamer_data.get("password") != password:
        return jsonify({"error": "Incorrect password"}), 401

    return jsonify({
        "message": "Login successful",
        "gamerId": gamer_data.get("gamerId"),
        "name": gamer_data.get("name")
    }), 200


@app.route("/gamer", methods=["GET"])
def get_gamer():
    gamer_ref = db_firestore.collection('gamers')
    docs = gamer_ref.stream()

    gamers = []
    for doc in docs:
        gamer_data = doc.to_dict()
        gamer_data['id'] = doc.id  # Add the document ID to the response
        gamers.append(gamer_data)

    return jsonify(gamers), 200

"""
Summary: 
    API "GET" call to get all publican data from firebase

Returns:
    .JSON + HTTP Status: Returns a .JSON file with the specified
    data of all publicans and HTTPS status 200 if successful
"""
@app.route("/publican", methods=["GET"])
def get_publican():
    publican_ref = db_firestore.collection('publicans')
    docs = publican_ref.stream()
    publicans = []
    for doc in docs:
        publican_data = doc.to_dict()
        publican_data['id'] = doc.id
        publicans.append(publican_data)
    
    return jsonify(publicans), 200

"""
Summary: 
    API "GET" call to get all game data from firebase

Returns:
    .JSON + HTTPS Status: Returns a .JSON file with the specified
    data of all games and HTTPS status 200 if successful
"""
@app.route("/game", methods=["GET"])
def get_game():
    games_ref = db_firestore.collection('games')
    docs = games_ref.stream()
    
    games = []
    for doc in docs:
        game_data = doc.to_dict()
        game_data['id'] = doc.id
        games.append(game_data)

    return jsonify(games), 200

"""
Summary: 
    API "POST" call that registers a gamer ID as a friend 

Args:
    .JSON: A .JSON file that has the necessary attributes to add a friend
    String gamer_id: A unique ID for the user entry adding a friend

Returns:
    .JSON + HTTP Status: On successful request, it returns
    a .JSON file with a confirmation message along with HTTP
    status 200. Failure to find a gamer ID or friend ID results in
    a .JSON file with an error message accustomed by the HTTP status
    404 for "NOT FOUND".
"""
@app.route("/add_friend/<string:gamer_id>", methods=["POST"])
def add_friend(gamer_id):
    data = request.get_json()
    friend_id = data.get('friend_id')

    gamers_ref = db_firestore.collection("gamers")

    # Find the documents where gamerId matches
    gamer_query = gamers_ref.where("gamerId", "==", gamer_id).stream()
    friend_query = gamers_ref.where("gamerId", "==", friend_id).stream()

    gamer_doc = next(gamer_query, None)
    friend_doc = next(friend_query, None)

    if not gamer_doc:
        return jsonify({"error": "Gamer not found"}), 404
    if not friend_doc:
        return jsonify({"error": "Friend ID not found"}), 404

    # Get document IDs
    gamer_doc_id = gamer_doc.id
    friend_doc_id = friend_doc.id

    # Ensure friends_list exists in both documents
    gamer_data = gamer_doc.to_dict()
    friend_data = friend_doc.to_dict()

    if "friends_list" not in gamer_data:
        gamer_data["friends_list"] = []
    if "friends_list" not in friend_data:
        friend_data["friends_list"] = []

    # Add friend_id to gamer and gamer_id to friend
    db_firestore.collection("gamers").document(gamer_doc_id).update({
        "friends_list": firestore.ArrayUnion([friend_id])
    })
    db_firestore.collection("gamers").document(friend_doc_id).update({
        "friends_list": firestore.ArrayUnion([gamer_id])
    })

    return jsonify({"message": "Friend added successfully for both users!"}), 200


"""
Summary: 
    API "POST" request that removes a friend entry from user

Args:
    .JSON: A .JSON file that has the necessary attributes to remove a friend
    String gamer_id: A unique ID for the user entry removing a friend

Returns:
    .JSON + HTTP Status: On successful request, it returns a .JSON
    file with a success message and HTTP status 200 for "OK". On a
    failed request for missing friend/gamer, it returns a .JSON file
    with an error message and HTTP status 404 for "NOT FOUND"
"""
@app.route("/remove_friend/<string:gamer_id>", methods=["POST"])
def remove_friend(gamer_id):
    data = request.get_json()
    friend_id = data.get("friend_id")

    gamers_ref = db_firestore.collection("gamers")

    # Find the documents where gamerId matches
    gamer_query = gamers_ref.where("gamerId", "==", gamer_id).stream()
    friend_query = gamers_ref.where("gamerId", "==", friend_id).stream()

    gamer_doc = next(gamer_query, None)
    friend_doc = next(friend_query, None)

    if not gamer_doc:
        return jsonify({"error": "Gamer not found"}), 404
    if not friend_doc:
        return jsonify({"error": "Friend ID not found"}), 404

    # Get document IDs
    gamer_doc_id = gamer_doc.id
    friend_doc_id = friend_doc.id

    # Ensure friends_list exists in both documents
    gamer_data = gamer_doc.to_dict()
    friend_data = friend_doc.to_dict()

    if "friends_list" not in gamer_data:
        gamer_data["friends_list"] = []
    if "friends_list" not in friend_data:
        friend_data["friends_list"] = []

    # Remove friend_id from gamer's list and gamer_id from friend's list
    db_firestore.collection("gamers").document(gamer_doc_id).update({
        "friends_list": firestore.ArrayRemove([friend_id])
    })
    db_firestore.collection("gamers").document(friend_doc_id).update({
        "friends_list": firestore.ArrayRemove([gamer_id])
    })

    return jsonify({"message": "Friend removed successfully for both users!"}), 200

"""
Summary: 
    API "POST" request that takes input data and creates a new gamer entry

Args:
    .JSON: A file with all the necessary data needed for a new gamer entry.

Returns:
    .JSON + HTTP Status: Upon successful request, returns a .JSON file with
    a success message and HTTP status 201 for "CREATED". Upon fail, it returns an
    error message with HTTP status 400 for "BAD REQUEST" if an attribute is missing
    
Exception:
    .JSON + HTTP Status: Upon failed communication with the firebase database
    a .JSON file with an error message including the exception is returned along 
    with HTTP status 500 for "INTERNAL SERVER ERROR"
"""
@app.route("/create_gamer", methods=["POST"])
def create_gamer():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')  # Ideally hash passwords before storing
    profile = data.get('profile')
    
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400

    # Create Gamer instance
    new_gamer = Gamer(name, email, password, profile)
    gamer_data = new_gamer.to_dict()

    try:
        # Save to Firestore in 'gamers' collection
        db_firestore.collection('gamers').document(new_gamer.get_gamer_id()).set(gamer_data)
        return jsonify({"message": "Gamer created successfully!", "gamer_id": new_gamer.get_gamer_id()}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create gamer: {str(e)}"}), 500

"""
Summary: 
    API "POST" request that creates a database entry for a new publican entry

Args:
    .JSON: A file which holds the necessary documentation and attributes

Returns:
    .JSON + HTTP Status: On a successful request, returns a .JSON file
    with a success message and HTTP status 201 for "CREATED". Otherwise, it returns
    a .JSON file with an error message on what is missing along with HTTP status 400
    for "BAD REQUEST".
    
Exception:
    If there is difficulty in communicating with the database, a .JSON file with
    the exception gets raised along with HTTP status 500 for "INTERNAL SERVER ERROR"
"""
@app.route('/create_publican', methods=['POST']) 
def create_publican(): 
    if 'image_file' not in request.files: 
        return jsonify({"error": "No image file provided"}), 400 
    image_file = request.files['image_file'] 
    if 'verification_file' not in request.files: 
        return jsonify({"error": "No verification file provided"}), 400 
    verification_file = request.files['verification_file'] 
    
    if image_file.filename == '' or verification_file.filename == '': 
        return jsonify({"error": "No image/verification file selected"}), 400

    # Check for required form fields 
    required_fields = ["pub_name", "email", "password", "address", "xcoord", "ycoord"] 
    if not all(field in request.form for field in required_fields): 
        missing = [field for field in required_fields if field not in request.form]
        return jsonify({"error": f"Missing required fields: {missing}"}), 400 
    
    try:
        # Upload image to Firebase Storage
        pub_name = request.form.get("pub_name")
        image_file_extension = os.path.splitext(image_file.filename)[1]
        image_storage_path = f"pub_images/{pub_name}_{int(time.time())}{image_file_extension}"
        image_url = generate_url(image_file, image_storage_path)

        # Upload pub verification to Firebase Storage
        verification_file_extension = os.path.splitext(verification_file.filename)[1]
        verification_storage_path = f"pub_verification/{pub_name}_{int(time.time())}{verification_file_extension}"
        verification_pdf_url = generate_url(verification_file, verification_storage_path)

        # Upload optional BER rating to Firebase Storage
        BER = None
        BER_url = None
        if 'BER' in request.form:
            if 'BER_file' not in request.files:
                return jsonify({"error": "No BER verification file provided"}), 400
            BER_file = request.files['BER_file']
            if BER_file.filename == '':
                return jsonify({"error": "No BER verification file selected"}), 400
            BER_file_extension = os.path.splitext(BER_file.filename)[1]
            BER_storage_path = f"BER_verification/{pub_name}_{int(time.time())}{BER_file_extension}"
            BER_url = generate_url(BER_file, BER_storage_path)        

        if 'BER_file' in request.files and 'BER' not in request.form:
            return jsonify({"error": "BER verification file provided, with no specified BER"}), 400

        # Collect other form data 
        publican_data = { 
            "pub_name": request.form.get("pub_name"), 
            "email": request.form.get("email"),
            "password": request.form.get("password"),  
            "address": request.form.get("address"), 
            "xcoord": request.form.get("xcoord"), 
            "ycoord": request.form.get("ycoord"), 
            "events": [], 
            "pub_image_url": image_url,  # Store URL instead of base64 image
            "verification_pdf_url": verification_pdf_url,
            "BER": request.form.get("BER"),
            "BER_url": BER_url
        } 
    
        new_publican_ref = db_firestore.collection('publicans').add(publican_data)
        return jsonify({"message": "Publican created", "pub_id": new_publican_ref[1].id}), 201 
    except Exception as e: 
        return jsonify({"error": f"Failed to create publican: {str(e)}"}), 500

"""
Summary: 
    Function that creates a URL for a given file in the database

Args:
    file: file object with the necessary data
    String storage_path: URL to the database where you want to store the file
    
Returns:
    String: Complete URL to the uploaded file from database
""" 
def generate_url(file, storage_path):
    # Use the existing bucket variable that was initialized at the top level
    # No need to call storage.bucket() again
    blob = bucket.blob(storage_path)
        
    # Reset file pointer before upload
    file.seek(0)
    blob.upload_from_file(file)
        
    # Make the file publicly accessible
    blob.make_public()
        
    # Get the public URL
    return blob.public_url

"""
Summary: 
    API "POST" call that makes an "event" entry in the database under a pub's ID
    
Args:
    .JSON: A file with all the necessary data from the frontend "create event" option

Returns:
    .JSON + HTTP Status: Returns a success message with HTTP status 201 for "CREATED"
    if the request is successful. For any invalid/missing inputs it returns a .JSON
    file with an error message and HTTP status 400 for "BAD REQUEST" or 404 for "NOT FOUND"
    
Exception:
    .JSON + HTTP Status: A .JSON file with an error message and a HTTP status of 500 for
    "INTERNAL SERVER ERROR" if no connection can be established with the firebase database
"""
@app.route("/create_event", methods=["POST"])
def create_event():
    data = request.get_json()

    required_fields = ["game_type", "start_time", "end_time", "expires", "pub_id"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    if data["game_type"] == "Seat Based":
        specific_fields = ["num_seats"]
    elif data["game_type"] == "Table Based":
        specific_fields = ["num_tables", "table_capacity"]
    else:
        return jsonify({"error": "Invalid game type"}), 400

    if not all(field in data for field in specific_fields):
        return jsonify({"error": "Missing required fields"}), 400

    publican_ref = db_firestore.collection('publicans').document(data["pub_id"])
    publican_doc = publican_ref.get()
    
    if not publican_doc.exists:
        return jsonify({"error": "Publican not found"}), 404
    
    publican_data = publican_doc.to_dict()
    
    start_time = datetime.fromisoformat(data["start_time"])
    end_time = datetime.fromisoformat(data["end_time"])
    total_hours = int((end_time - start_time).total_seconds() / 3600)

    available_slots = {}
    for i in range (total_hours):
        slot_start = (start_time + timedelta(hours=i)).strftime("%H:%M")
        slot_end = (start_time + timedelta(hours=i + 1)).strftime("%H:%M")
        slot_key = f"{slot_start}-{slot_end}"

        if data["game_type"] == "Seat Based":
            available_slots[slot_key] = data["num_seats"]  
        elif data["game_type"] == "Table Based":
            available_slots[slot_key] = data["num_tables"] 


    event_data = {
        "game_type": data["game_type"],
        "start_time": data["start_time"],
        "end_time": data["end_time"],
        "expires": data["expires"],
        "pub_id": data["pub_id"],
        "pub_name": publican_data["pub_name"],
        "available_slots": available_slots
    }

    if data["game_type"] == "Seat Based":
        event_data["num_seats"] = data["num_seats"]
    elif data["game_type"] == "Table Based":
        event_data["num_tables"] = data["num_tables"]
        event_data["table_capacity"] = data["table_capacity"]

    try:
        new_event_ref = db_firestore.collection('events').add(event_data)
        event_id = new_event_ref[1].id  

        publican_ref.update({
            "events": firestore.ArrayUnion([event_id]) 
        })

        return jsonify({
            "message": "Event created successfully!",
            "event_id": event_id
        }), 201

    except Exception as e:
        return jsonify({"error": f"Failed to create event: {str(e)}"}), 500


"""
Summary: 
    API "POST" call that takes the necessary input data to make a game entry in the database

Args:
    .JSON: Takes in a .JSON file with all the user input values and extracts it to create 
    the necessary entry in the database.

Returns:
    .JSON + HTTP Status: Returns a .JSON success message and HTTP status 201 for "CREATED"
    upon a successful request. In the scenario of missing/invalid attribute properties it returns
    a .JSON file with and error message along with HTTP status 400 for "BAD REQUEST" if there are missing
    attributes or 404 for "NOT FOUND" is there are missing database entries 
    
Exception:
    .JSON + HTTP Status: If there are difficulties communicating with the database, there is an exception
    that returns an error message in a .JSON file and HTTP status 500 for "INTERNAL SERVER ERROR"
"""
@app.route("/create_game", methods=["POST"])
def create_game():
    data = request.get_json()
    
    # Note: game type here is description of game, not seat based or table based similar to an event
    required_fields = ["game_name", "game_desc", "game_type", "start_time", "end_time", "expires", "pub_id", "gamer_id", "max_players"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    publican_ref = db_firestore.collection('publicans').document(data["pub_id"])
    publican_doc = publican_ref.get()
    if not publican_doc.exists:
        return jsonify({"error": "Pub not found"}), 404
    publican_data = publican_doc.to_dict()
    
    gamer_ref = db_firestore.collection('gamers').document(data["gamer_id"])
    gamer_doc = gamer_ref.get()
    if not gamer_doc.exists:
        return jsonify({"error": "Gamer not found"}), 404

    start_time = datetime.fromisoformat(data["start_time"])
    end_time = datetime.fromisoformat(data["end_time"])
    
    # event must start and end on an hourly time slot
    event_ref = (db_firestore.collection('events').where("pub_id", "==", data["pub_id"]).
                   where("start_time", "<=", data["start_time"]).where("end_time", ">=", data["end_time"]).stream())
    event_doc = next(event_ref, None)
    if not event_doc:
        return jsonify({"error": "No events found during specified time for this pub"}), 404
    event_data = event_doc.to_dict()
    
    start_time = start_time.time()
    end_time = end_time.time()

    available_slots = event_doc.get("available_slots")
    for slot_key, slot_value in available_slots.items():
        string_start, string_end = slot_key.split('-')
        slot_start = datetime.strptime(string_start, "%H:%M").time()
        slot_end = datetime.strptime(string_end, "%H:%M").time()
        if slot_start >= start_time and slot_end <= end_time:

            if event_data["game_type"] == "Seat Based":
                slot_value -= data["max_players"]

            # if table based, round up on number of tables for players
            if event_data["game_type"] == "Table Based":
                table_divisor = event_data["table_capacity"]
                tables = data["max_players"] // table_divisor
                if data["max_players"] % table_divisor > 0:
                    tables += 1
                slot_value -= tables
            
            if slot_value < 0:
                return jsonify({"error": "Not enough room available"}), 400
            
            available_slots[slot_key] = slot_value

    host = data["gamer_id"]
    game_name = data["game_name"]
    game_desc = data["game_desc"]
    game_type = data["game_type"]
    start_time = data["start_time"]
    end_time = data["end_time"]
    expires = data["expires"]
    pub_id = data["pub_id"]
    location = publican_data["pub_name"]
    xcoord = publican_data["xcoord"]
    ycoord = publican_data["ycoord"]
    max_players = data["max_players"]

    # Debugging print statements to check values
    print(f"DEBUG: Expires: {expires}, X: {xcoord}, Y: {ycoord}")

    # Correctly instantiate SeatBasedGame and TableBasedGame
    if event_data["game_type"] == "Seat Based":
        new_game = SeatBasedGame(host, game_name, game_desc, game_type, start_time, end_time, expires, pub_id, location, xcoord, ycoord, max_players)
    elif event_data["game_type"] == "Table Based":
        tables = data.get("tables", [])
        new_game = TableBasedGame(host, game_name, game_desc, game_type, start_time, end_time, expires, pub_id, location, xcoord, ycoord, max_players, tables)
    else:
        return jsonify({"error": "Invalid game instantiation"}), 400
    
    game_data = new_game.get_game_details()

    try:
        new_game_ref = db_firestore.collection('games').add(game_data)
        game_id = new_game_ref[1].id  

        gamer_ref.update({
            "hosted_games": firestore.ArrayUnion([game_id]) 
        })

        db_firestore.collection('events').document(event_doc.id).update({
            "available_slots": available_slots
        })

        return jsonify({
            "message": "Game created successfully!",
            "game_id": game_id
        }), 201

    except Exception as e:
        return jsonify({"error": f"Failed to create game: {str(e)}"}), 500

"""
Summary:
    API "POST" call that registers a user to join a game event in the database 
    
Args:
    .JSON: A .JSON file with the necessary attributes to fully register a gamer as
    "signed up" for a game event

Returns:
    .JSON + HTTP Status: Upon a successful join request, a .JSON file with a success
    message is returned along with HTTP Status 200 for "OK". In the scenario that
    there are any missing/invalid attributes, a respective error message in .JSON format is
    returned along with HTTP status 404 for "NOT FOUND" or 400 for "BAD REQUEST" dependind
    on the error type
"""
@app.route("/join_game", methods=["POST"])
def join_game():
    data = request.get_json()
    
    required_fields = ["game_id", "gamer_id"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    game_ref = db_firestore.collection('games').document(data["game_id"])
    game_doc = game_ref.get()
    if not game_doc.exists:
        return jsonify({"error": "Game not found"}), 404
    game_data = game_doc.to_dict()

    gamer_ref = db_firestore.collection('gamers').document(data["gamer_id"])
    gamer_doc = gamer_ref.get()
    if not gamer_doc.exists:
        return jsonify({"error": "Gamer not found"}), 404

    current_players = game_data.get("players", [])
    max_players = game_data["max_players"]
    if len(current_players) >= max_players:
        return jsonify({"error": "Game is full"}), 400
    if data["gamer_id"] in current_players:
        return jsonify({"error": "User already joined the game"}), 400

    game_ref.update({
        "participants": firestore.ArrayUnion([data["gamer_id"]])
    })
    gamer_ref.update({
       "joined_games": firestore.ArrayUnion([data["game_id"]]) 
    })

    return jsonify({"message": "Joined game"}), 200

"""
Summary:
    API "POST" call that removes a player entry from a game

Args:
    .JSON: A file which contains the necessary fields to unregister a gamer from
    a game event

Returns:
    .JSON + HTTP Status: Upon a successful request, a success message returns in
    .JSON file format accompanied with th HTTP status of 200 for "OK". In the scenario 
    that there are missing or invalid attributes, an error message is instead returned in
    the same file format along with HTTP status 404 for "NOT FOUND" or 400 for "BAD REQUEST"
    respectively
"""
@app.route("/leave_game", methods=["POST"])
def leave_game():
    data = request.get_json()
    
    required_fields = ["game_id", "gamer_id"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    game_ref = db_firestore.collection('games').document(data["game_id"])
    game_doc = game_ref.get()
    if not game_doc.exists:
        return jsonify({"error": "Game not found"}), 404
    game_data = game_doc.to_dict()

    gamer_ref = db_firestore.collection('gamers').document(data["gamer_id"])
    gamer_doc = gamer_ref.get()
    if not gamer_doc.exists:
        return jsonify({"error": "Gamer not found"}), 404

    current_players = game_data.get("players", [])
    if data["gamer_id"] not in current_players:
        return jsonify({"error": "User has not joined the game"}), 400

    game_ref.update({
        "participants": firestore.ArrayRemove([data["gamer_id"]])
    })
    gamer_ref.update({
       "joined_games": firestore.ArrayRemove([data["game_id"]])
    })

    return jsonify({"message": "Left the game"}), 200


"""
Summary:
    API "PATCH" call that updates an existing gamer profile
    
Args:
    .JSON: A file containing the necessary fields to change in
    the database's sleected gamer profile entry
    String gamer_id: A unique string given to the gamer class entry

Returns:
    .JSON + HTTP Status: Upon a successful request, a success message is returned in .JSON
    formet with HTTP status 200 for "OK". In the scenario that there are any missing fields or
    invalid fields in the input, an error message in .JSON format is returned with HTTP status
    404 for "NOT FOUND" or 400 for "BAD REQUEST" respectively
"""
@app.route("/update_profile/<string:gamer_id>", methods=["PATCH"])
def update_profile(gamer_id):
    data = request.get_json()
    new_profile = data.get("profile")

    if new_profile not in [str(i).zfill(2) for i in range(1, 13)]:
        return jsonify({"error": "Invalid profile ID. Choose between '01' and '12'."}), 400

    gamers_ref = db_firestore.collection("gamers")
    gamer_query = gamers_ref.where("gamerId", "==", gamer_id).stream()
    gamer_doc = next(gamer_query, None)

    if not gamer_doc:
        return jsonify({"error": "Gamer not found"}), 404

    # Update the profile icon
    db_firestore.collection("gamers").document(gamer_doc.id).update({
        "profile": new_profile
    })

    return jsonify({
        "message": "Profile updated successfully!", 
        "new_profile": f"/static/icons/{new_profile}.png"
    }), 200

"""
Summary:
    API "PATCH" call that allows file type inputs to be uploaded to the database

Args:
    file: A file object that has necessary legality information regarding publican user class

Returns:
    .JSON + HTTP Status: Upon a successful request, a success message in .JSON format gets returned
    with HTTP status 200 fo "OK". For an missing or invalid file input, an error message in .JSON format
    is returned with HTTP status 404 for "NOT FOUND" or 400 for "BAD REQUEST" respectively
"""
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        return jsonify({"message": "File uploaded successfully", "file_path": file_path}), 200

"""
Summary:
    API "PATCH" call that stores an image file in the database under a specific publican entry

Args:
    file: An image based file of presumably the publican's pub
    String publican_id: A specific unique ID given to the publican class entry

Returns:
    .JSON + HTTP Status: Upon a successful request, a success message is returned in .JSON format
    and HTTP status 200 for "OK". In the scenario that the input file is missing, an error
    message in .JSON format is returned with either HTTP status 404 for "NOT FOUND".
    
Exception:
    .JSON + HTTP Status: In case there is difficulty reaching the database, and error message
    in .JSON format is returned with HTTP status 500 for "INTERNAL SERVER ERROR"
"""
@app.route('/update_pub_image/<string:publican_id>', methods=['POST'])
def update_pub_image(publican_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Update the pub image path in Firestore
        publican_ref = db_firestore.collection('publicans').document(publican_id)
        try:
            publican_ref.update({"pub_image": file_path})
            return jsonify({"message": "Pub image updated successfully!"}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to update pub image: {str(e)}"}), 500

"""
Summary:
    API "PATCH" call that updates a publican user entry in the database

Args:
    .JSON: A .JSON file of attributes with all the desired changes for the user
    String publican_id: A unique string ID give to the publican class entry

Returns:
    .JSON + HTTP Status: On a successful request, a success message gets returned in
    .JSON format along with HTTP status 200 for "OK"
"""
@app.route("/update_publican/<string:publican_id>", methods=["PATCH"])
def update_publican(publican_id):
    data = request.get_json()
    publican_ref = db_firestore.collection('publicans').document(publican_id)

    publican_ref.update(data)
    return jsonify({"message": "Publican updated successfully!"}), 200

"""
Summary:
    API "PATCH" call that updates a game entry in the database

Args:
    .JSON: A .JSON file that has all the necessary updates for the given game entry
    String game_id: A unique string ID given to the game class entry

Returns:
    .JSON + HTTP Status: Upon a successful request, a success message is returned in
    .JSON format along with HTTP status 200 for "OK"
"""
@app.route("/update_game/<string:game_id>", methods=["PATCH"])
def update_game(game_id):
    data = request.get_json()
    game_ref = db_firestore.collection('games').document(game_id)

    # Update game fields
    game_ref.update(data)

    return jsonify({"message": "Game updated successfully!"}), 200

"""
Summary:
    API "DELETE" call that removes a publican entry from the database

Args:
    String publican_id: A string variable that is unique to the publican entry

Returns:
    .JSON + HTTP Status: Upon a successful request, a success message is returned in
    .JSON format with HTTP status 200 for "OK"
"""
@app.route("/delete_publican/<string:publican_id>", methods=["DELETE"])
def delete_publican(publican_id):
    publican_ref = db_firestore.collection('publicans').document(publican_id)
    publican_ref.delete()
    return jsonify({"message": "Publican deleted successfully!"}), 200

## Running this file as main
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)