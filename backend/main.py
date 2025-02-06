from flask import Flask, request, jsonify
from Gamer import Gamer
from Publican import Publican
from Game import Game

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
    pass

@app.route("/publican", methods=["GET"])
def get_publican():
    pass

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
    pass

@app.route("/create_publican", methods=["POST"])
def create_publican():
    pass

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
@app.route("/update_gamer/<int:gamer_id>", methods=["PATCH"])
def update_gamer():
    pass

@app.route("/update_publican/<int:publican_id>", methods=["PATCH"])
def update_publican():
    pass

@app.route("/update_game/<string:game_id>", methods=["PATCH"])
def update_game(game_id):
    data = request.get_json()
    game_ref = db_firestore.collection('games').document(game_id)

    # Update game fields
    game_ref.update(data)

    return jsonify({"message": "Game updated successfully!"}), 200


## Running this file as main
if __name__ == "__main__":
    app.run(debug=True)
