import unittest
from Gamer import Gamer

class TestGamer(unittest.TestCase):

    def setUp(self):
        self.gamer1 = Gamer("Alice", "alice@example.com", "securepassword")
        self.gamer2 = Gamer("Bob", "bob@example.com", "strongpassword")

    def test_creation(self):
        self.assertEqual(self.gamer1.get_name(), "Alice")
        self.assertEqual(self.gamer1.get_email(), "alice@example.com")
        self.assertEqual(self.gamer1.get_password(), "securepassword")
        self.assertNotEqual(self.gamer1.get_gamer_id(), self.gamer2.get_gamer_id())

    def test_host(self):
        self.gamer1.host_game("Poker Night")
        self.assertIn("Poker Night", self.gamer1.hosted_games)

    def test_join(self):
        self.gamer1.join_game("D&D Session")
        self.assertIn("D&D Session", self.gamer1.joined_games)

    def test_add(self):
        result = self.gamer1.add_friend(self.gamer2.get_gamer_id())
        self.assertTrue(result)
        self.assertIn(self.gamer2.get_gamer_id(), self.gamer1.friends_list)

        # Adding the same friend again --> False
        result_again = self.gamer1.add_friend(self.gamer2.get_gamer_id())
        self.assertFalse(result_again)

    def test_remove_friend(self):
        self.gamer1.add_friend(self.gamer2.get_gamer_id())
        result = self.gamer1.remove_friend(self.gamer2.get_gamer_id())
        self.assertTrue(result)
        self.assertNotIn(self.gamer2.get_gamer_id(), self.gamer1.friends_list)

        # Removing a non-existent friend --> False
        result_again = self.gamer1.remove_friend("FAKE_ID")
        self.assertFalse(result_again)