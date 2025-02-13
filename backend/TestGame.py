import unittest
from game import Game, SeatBasedGame, TableBasedGame


class TestGame(unittest.TestCase):

    def setUp(self):
        self.game = Game("Alice", "Chess Tournament", "Board Game", "13-2-2025", "Dublin", 4)

    def test_creation(self):
        self.assertEqual(self.game.get_host(), "Alice")
        self.assertEqual(self.game.get_game_name(), "Chess Tournament")
        self.assertEqual(self.game.get_game_type(), "Board Game")
        self.assertEqual(self.game.get_date(), "13-2-2025")
        self.assertEqual(self.game.get_location(), "Dublin")
        self.assertEqual(self.game.get_max_players(), 4)
        self.assertEqual(self.game.get_participants(), [])

    def test_add_participant(self):
        result = self.game.add_participant("Bob")
        self.assertEqual(result, "Bob has joined the game.")
        self.assertIn("Bob", self.game.get_participants())

    def test_add_participant_game_full(self):
        self.game.add_participant("Bob")
        self.game.add_participant("Charlie")
        self.game.add_participant("Dave")
        self.game.add_participant("Eve")
        
        result = self.game.add_participant("Frank")
        self.assertEqual(result, "Game is full.")
        self.assertNotIn("Frank", self.game.get_participants())

    def test_remove_participant(self):
        self.game.add_participant("Bob")
        result = self.game.remove_participant("Bob")
        self.assertEqual(result, "Bob has left the game.")
        self.assertNotIn("Bob", self.game.get_participants())

    def test_remove_nonexistent_participant(self):
        result = self.game.remove_participant("Bob")
        self.assertEqual(result, "Participant not found.")

    def test_get_game_details(self):
        self.game.add_participant("Bob")
        details = self.game.get_game_details()
        self.assertEqual(details["host"], "Alice")
        self.assertIn("Bob", details["participants"])


class TestSeatBasedGame(unittest.TestCase):

    def setUp(self):
        self.seat_game = SeatBasedGame("Alice", "Poker Night", "Card Game", "13-2-2025", "Las Vegas", 3)

    def test_reserve_seat(self):
        result = self.seat_game.reserve_seat("Bob", 1)
        self.assertEqual(result, "Bob has reserved seat 1.")
        self.assertEqual(self.seat_game.get_seat_details()[1], "Bob")

    def test_reserve_already_taken_seat(self):
        self.seat_game.reserve_seat("Bob", 1)
        result = self.seat_game.reserve_seat("Charlie", 1)
        self.assertEqual(result, "Seat already taken.")

    def test_reserve_invalid_seat(self):
        result = self.seat_game.reserve_seat("Bob", 5)
        self.assertEqual(result, "Invalid seat number.")

    def test_cancel_reservation(self):
        self.seat_game.reserve_seat("Bob", 2)
        result = self.seat_game.cancel_reservation("Bob")
        self.assertEqual(result, "Bob's reservation for seat 2 has been canceled.")
        self.assertIsNone(self.seat_game.get_seat_details()[2])

    def test_cancel_nonexistent_reservation(self):
        result = self.seat_game.cancel_reservation("Bob")
        self.assertEqual(result, "Participant not found.")


class TestTableBasedGame(unittest.TestCase):

    def setUp(self):
        self.table_game = TableBasedGame("Alice", "Board Game Night", "Strategy", "13-2-2025", "London", 6, ["Table A", "Table B"])

    def test_reserve_table_spot(self):
        result = self.table_game.reserve_table_spot("Bob", "Table A")
        self.assertEqual(result, "Bob has reserved a spot at Table A.")
        self.assertIn("Bob", self.table_game.get_table_details()["Table A"])

    def test_reserve_table_spot_table_full(self):
        self.table_game.reserve_table_spot("Bob", "Table A")
        self.table_game.reserve_table_spot("Charlie", "Table A")
        self.table_game.reserve_table_spot("Dave", "Table A")

        result = self.table_game.reserve_table_spot("Eve", "Table A")
        self.assertEqual(result, "Table is full.")

    def test_reserve_nonexistent_table(self):
        result = self.table_game.reserve_table_spot("Bob", "Table X")
        self.assertEqual(result, "Table not found.")

    def test_cancel_table_reservation(self):
        self.table_game.reserve_table_spot("Bob", "Table B")
        result = self.table_game.cancel_table_reservation("Bob")
        self.assertEqual(result, "Bob's reservation at Table B has been canceled.")
        self.assertNotIn("Bob", self.table_game.get_table_details()["Table B"])

    def test_cancel_nonexistent_table_reservation(self):
        result = self.table_game.cancel_table_reservation("Bob")
        self.assertEqual(result, "Participant not found.")
