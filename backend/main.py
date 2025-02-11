from flask import Flask, request, jsonify
from Gamer import Gamer
from Publican import Publican
from game import Game

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Flask App
app = Flask(__name__)

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db_firestore = firestore.client()


## GET REQUESTS
@app.route("/gamer", methods=["GET"])
def get_gamer():
    gamers_ref = db_firestore.collection('gamers')
    docs = gamers_ref.stream()
    
    gamers = []
    for doc in docs:
        gamer_data = doc.to_dict()
        gamer_data['id'] = doc.id
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


## POST REQUESTS
@app.route("/create_gamer", methods=["POST"])
def create_gamer():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    
    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
    
    gamer = Gamer(name, email, password)
    gamer_data = {
        "name": gamer.get_name(),
        "email": gamer.get_email(),
        "hosted_games": gamer.hosted_games,
        "joined_games": gamer.joined_games
    }
    
    new_gamer_ref = db_firestore.collection("gamers").add(gamer_data)
    return jsonify({"message": "Gamer created successfully!", "gamer_id": new_gamer_ref[1].id}), 201

@app.route("/create_publican", methods=["POST"])
def create_publican():
    data = request.get_json()
    pub_name = data.get('pub_name')
    email = data.get('email')
    ID = data.get('ID')
    password = data.get('password')
    address = data.get('address')
    tables = data.get('tables')

    publican = Publican(pub_name, email, ID, password, address, tables)

    new_publican_ref = db_firestore.collection('publicans').add(publican.pub_details())

    return jsonify({"message": "Publican created", "pub_id": new_publican_ref.id}), 201

@app.route("/create_game", methods=["POST"])
def create_game():
    data = request.get_json()
    host = data.get('host')
    game_name = data.get('game_name')
    game_type = data.get('game_type')
    date = data.get('date')
    location = data.get('location')
    max_players = data.get('max_players')

    # Create Game object
    game = Game(host, game_name, game_type, date, location, max_players)

    # Add game to Firestore
    new_game_ref = db_firestore.collection('games').add(game.get_game_details())

    return jsonify({"message": "Game created successfully!", "game_id": new_game_ref[1].id}), 201


## PATCH REQUESTS
@app.route("/update_gamer/<string:gamer_id>", methods=["PATCH"])
def update_gamer(gamer_id):
    data = request.json
    gamer_ref = db_firestore.collection('gamers').document(gamer_id)
    
    gamer_doc = gamer_ref.get()
    if not gamer_doc.exists:
        return jsonify({"error": "Gamer not found"}), 404
    
    gamer_data = gamer_doc.to_dict()
    gamer = Gamer(gamer_data["name"], gamer_data["email"], "hidden_password")
    gamer.hosted_games = gamer_data.get("hosted_games", [])
    gamer.joined_games = gamer_data.get("joined_games", [])
    
    if "name" in data:
        gamer.set_name(data["name"])
    if "password" in data:
        gamer.set_password(data["password"])
    
    updated_data = {
        "name": gamer.get_name(),
        "hosted_games": gamer.hosted_games,
        "joined_games": gamer.joined_games
    }
    
    gamer_ref.update(updated_data)
    return jsonify({"message": "Gamer updated successfully!"}), 200

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
