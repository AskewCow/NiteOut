from flask import Flask, request, jsonify
from flask_apscheduler import APScheduler
from Gamer import Gamer
from Publican import Publican
from game import Game, SeatBasedGame, TableBasedGame
from datetime import datetime, timedelta

import firebase_admin
from firebase_admin import credentials, firestore

class Config:
    SCHEDULER_API_ENABLED = True

# Initialize Flask App
app = Flask(__name__)
app.config.from_object(Config())

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# Initialize Firebase
# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")

# Check if Firebase has already been initialized
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db_firestore = firestore.client()

# Define a function to perform the refresh
def refresh_data():
    # Include logic to refresh or update data here
    print("Data refreshed at interval")

# Schedule the function to run every 10 minutes
scheduler.add_job(id='Scheduled Task', func=refresh_data, trigger='interval', minutes=30)


## GET REQUESTS
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



## POST REQUESTS
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


@app.route("/create_publican", methods=["POST"])
def create_publican():
    data = request.get_json()

    required_fields = ["pub_name", "email", "ID", "password", "address", "xcoord", "ycoord", "tables"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    publican_data = {
        "pub_name": data.get("pub_name"),
        "email": data.get("email"),
        "ID": data.get("ID"),
        "password": data.get("password"), 
        "address": data.get("address"),
        "xcoord": data.get("xcoord"),
        "ycoord": data.get("ycoord"),
        "tables": data.get("tables"),
        "events": []  
    }

    try:
        new_publican_ref = db_firestore.collection('publicans').add(publican_data)[1]
        return jsonify({"message": "Publican created", "pub_id": new_publican_ref.id}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create publican: {str(e)}"}), 500


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


## PATCH REQUESTS
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


@app.route("/update_publican/<string:publican_id>", methods=["PATCH"])
def update_publican(publican_id):
    data = request.get_json()
    publican_ref = db_firestore.collection('publicans').document(publican_id)

    publican_ref.update(data)
    return jsonify({"message": "Publican updated successfully!"}), 200

@app.route("/update_game/<string:game_id>", methods=["PATCH"])
def update_game(game_id):
    data = request.get_json()
    game_ref = db_firestore.collection('games').document(game_id)

    # Update game fields
    game_ref.update(data)

    return jsonify({"message": "Game updated successfully!"}), 200

@app.route("/delete_publican/<string:publican_id>", methods=["DELETE"])
def delete_publican(publican_id):
    publican_ref = db_firestore.collection('publicans').document(publican_id)
    publican_ref.delete()
    return jsonify({"message": "Publican deleted successfully!"}), 200

## Running this file as main
if __name__ == "__main__":
    app.run(debug=True)
