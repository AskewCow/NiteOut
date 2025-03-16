import pytest
import sys
import os 
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from game import Game, SeatBasedGame, TableBasedGame

@pytest.mark.xfail
def test_fail_wrong_host():
    """
    Intentionally expects the host to be "Bob" instead of the actual "Alice".
    """
    game = Game("Alice", "Poker Night", "Card Game", "18:00", "21:00", "23:00", "Pub A", 10.0, 20.0, 5)
    assert game.get_host() == "Alice", f"Expected host to be 'Alice', but got '{game.get_host()}'."

@pytest.mark.xfail
def test_fail_add_participant():
    """
    Intentionally expects a different join message than the correct one.
    Correct message is 'Charlie has joined the game.'.
    """
    game = Game("Alice", "Poker Night", "Card Game", "18:00", "21:00", "23:00", "Pub A", 10.0, 20.0, 1)
    result = game.add_participant("Charlie")
    expected_message = "Charlie has joined the game."
    assert result == expected_message, f"Expected message: '{expected_message}', but got '{result}'."

@pytest.mark.xfail
def test_fail_remove_participant():
    """
    Intentionally expects a removal message that differs from the actual one.
    The correct message for a non-existent participant is 'Participant not found.'.
    """
    game = Game("Alice", "Poker Night", "Card Game", "18:00", "21:00", "23:00", "Pub A", 10.0, 20.0, 5)
    result = game.remove_participant("Dave")
    expected_message = "Participant not found."
    assert result == expected_message, f"Expected message: '{expected_message}', but got '{result}'."

# ----- Tests for the SeatBasedGame class -----
@pytest.mark.xfail
def test_fail_seat_already_taken():
    """
    Intentionally expects an alternative message when a seat is already taken.
    The correct message is 'Seat already taken.'.
    """
    seat_game = SeatBasedGame("Alice", "Chess Tournament", "Board Game", "17:00", "19:00", "23:59", "Pub B", 10.5, 20.5, 4)
    seat_game.reserve_seat("Bob", 1)
    result = seat_game.reserve_seat("Charlie", 1)
    expected_message = "Seat is already taken."
    assert result == expected_message, f"Expected message: '{expected_message}', but got '{result}'."

@pytest.mark.xfail
def test_fail_cancel_seat_reservation():
    """
    Intentionally expects a different cancellation message than the actual one.
    The correct message is 'Charlie's reservation for seat 2 has been canceled.'.
    """
    seat_game = SeatBasedGame("Alice", "Chess Tournament", "Board Game", "17:00", "19:00", "23:59", "Pub B", 10.5, 20.5, 4)
    seat_game.reserve_seat("Charlie", 2)
    result = seat_game.cancel_reservation("Charlie")
    expected_message = "Charlie's reservation for seat 2 has been canceled."
    assert result == expected_message, f"Expected message: '{expected_message}', but got '{result}'."

# ----- Tests for the TableBasedGame class -----
@pytest.mark.xfail
def test_fail_reserve_table_wrong_message():
    """
    Intentionally expects a wrong message format for a successful table spot reservation.
    The correct message is 'Bob has reserved a spot at Table 1.'.
    """
    table_game = TableBasedGame("Alice", "D&D Night", "Roleplaying", "19:00", "22:00", "23:59", "Pub C", 10.2, 21.8, 6, ["Table 1", "Table 2"])
    result = table_game.reserve_table_spot("Bob", "Table 1")
    expected_message = "Bob has reserved a spot at Table 1."
    assert result == expected_message, f"Expected message: '{expected_message}', but got '{result}'."

@pytest.mark.xfail
def test_fail_cancel_table_reservation_wrong_message():
    """
    Intentionally expects an alternative cancellation message for a table reservation.
    The correct message is 'Charlie's reservation at Table 1 has been canceled.'.
    """
    table_game = TableBasedGame("Alice", "D&D Night", "Roleplaying", "19:00", "22:00", "23:59", "Pub C", 10.2, 21.8, 6, ["Table 1", "Table 2"])
    table_game.reserve_table_spot("Charlie", "Table 1")
    result = table_game.cancel_table_reservation("Charlie")
    expected_message = "Charlie's reservation at Table 1 has been canceled."
    assert result == expected_message, f"Expected message: '{expected_message}', but got '{result}'."