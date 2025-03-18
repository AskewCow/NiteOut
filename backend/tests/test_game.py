import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from game import Game, SeatBasedGame, TableBasedGame

# Test Game class
def test_game_initialization():
    game = Game("Alice", "Poker Night", "A fun poker game.", "Card Game", "18:00", "21:00", "23:00", "PUB123", "Pub A", 10.0, 20.0, 5)

    assert game.get_host() == "Alice"
    assert game.get_game_name() == "Poker Night"
    assert game.get_game_desc() == "A fun poker game."  
    assert game.get_game_type() == "Card Game"
    assert game.get_start_time() == "18:00"
    assert game.get_end_time() == "21:00"
    assert game.get_expires() == "23:00"
    assert game.get_pub_id() == "PUB123"  
    assert game.get_location() == "Pub A"
    assert game.get_xcoord() == 10.0
    assert game.get_ycoord() == 20.0
    assert game.get_max_players() == 5
    assert game.get_participants() == []

def test_game_participants():
    game = Game("Alice", "Poker Night", "A fun poker game.", "Card Game", "18:00", "21:00", "23:00", "PUB123", "Pub A", 10.0, 20.0, 2)

    assert game.add_participant("Bob") == "Bob has joined the game."
    assert game.add_participant("Charlie") == "Charlie has joined the game."
    assert game.add_participant("Dave") == "Game is full."

    assert game.remove_participant("Bob") == "Bob has left the game."
    assert game.remove_participant("Eve") == "Participant not found."

def test_seat_based_game():
    seat_game = SeatBasedGame("Alice", "Chess Tournament", "Competitive chess event.", "Board Game", "17:00", "19:00", "23:59", "PUB456", "Pub B", 10.5, 20.5, 4)

    assert seat_game.reserve_seat("Bob", 1) == "Bob has reserved seat 1."
    assert seat_game.reserve_seat("Charlie", 1) == "Seat already taken."
    assert seat_game.reserve_seat("Charlie", 2) == "Charlie has reserved seat 2."
    assert seat_game.cancel_reservation("Charlie") == "Charlie's reservation for seat 2 has been canceled."
    assert seat_game.cancel_reservation("Eve") == "Participant not found."

def test_table_based_game():
    table_game = TableBasedGame("Alice", "D&D Night", "Tabletop roleplaying session.", "Roleplaying", "19:00", "22:00", "23:59", "PUB789", "Pub C", 10.2, 21.8, 6, ["Table 1", "Table 2"])

    assert table_game.reserve_table_spot("Bob", "Table 1") == "Bob has reserved a spot at Table 1."
    assert table_game.reserve_table_spot("Charlie", "Table 1") == "Charlie has reserved a spot at Table 1."
    assert table_game.reserve_table_spot("Eve", "Table 3") == "Table not found."
    assert table_game.cancel_table_reservation("Charlie") == "Charlie's reservation at Table 1 has been canceled."
    assert table_game.cancel_table_reservation("Eve") == "Participant not found."