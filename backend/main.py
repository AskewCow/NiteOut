from flask import Flask, request, jsonify
from Gamer import Gamer
from Publican import Publican
from game import Game, SeatBasedGame, TableBasedGame

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Flask App
app = Flask(__name__)

# Initialize Firebase
# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")

# Check if Firebase has already been initialized
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db_firestore = firestore.client()



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
    
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400

    # Create Gamer instance
    new_gamer = Gamer(name, email, password)
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
    pub_name = data.get('pub_name')
    email = data.get('email')
    ID = data.get('ID')
    password = data.get('password')
    address = data.get('address')
    xcoord = data.get('xcoord')
    ycoord = data.get('ycoord')
    tables = data.get('tables')

    publican = Publican(pub_name, email, ID, password, address, xcoord, ycoord, tables)

    new_publican_ref = db_firestore.collection('publicans').add(publican.pub_details())

    return jsonify({"message": "Publican created", "pub_id": new_publican_ref[1].id}), 201
@app.route("/create_game", methods=["POST"])
def create_game():
    data = request.get_json()
    host = data.get('host')
    game_name = data.get('game_name')
    game_type = data.get('game_type')
    date = data.get('date')
    location = data.get('location')
    max_players = data.get('max_players')
    
    # Handle seat-based or table-based games
    if game_type == "seat_based":
        game = SeatBasedGame(host, game_name, game_type, date, location, max_players)
    elif game_type == "table_based":
        tables = data.get('tables', [])
        game = TableBasedGame(host, game_name, game_type, date, location, max_players, tables)
    else:
        game = Game(host, game_name, game_type, date, location, max_players)

    # Add game to Firestore
    new_game_ref = db_firestore.collection('games').add(game.get_game_details())

    return jsonify({"message": "Game created successfully!", "game_id": new_game_ref[1].id}), 201


## PATCH REQUESTS
@app.route("/update_gamer/<int:gamer_id>", methods=["PATCH"])
def update_gamer(gamer_id):
    pass

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
