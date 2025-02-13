import unittest
from Publican import Publican

class TestPublican(unittest.TestCase):
    
    def setUp(self):
        self.Publican = Publican("Cassidy's", "cassidys@gmail.com", "231", "password", "123 Shoe Lane", 53.349805, -6.26031, 10)
    
    def test_pub_details(self):
        details = self.Publican.pub_details()
        self.assertEqual(details["name"], "Cassidy's")
        self.assertEqual(details["email"], "cassidys@gmail.com")
        self.assertEqual(details["ID(verification)"], "231")
        self.assertEqual(details["password"], "password")
        self.assertEqual(details["address"], "123 Shoe Lane")
        self.assertEqual(details["xcoord"], 53.349805)
        self.assertEqual(details["ycoord"], -6.26031)
        self.assertEqual(details["tables"], 10)

    def test_reserve_table(self):
        result = self.Publican.reserve_table(4)
        self.assertEqual(result, "Table reserved.")
        self.assertEqual(self.Publican.get_tables(), 9)

    def test_reserve_table_not_enough_tables(self):
        self.Publican = Publican(
            pub_name="Doyle's", 
            email="doyles@gmail.com", 
            ID="345", 
            password="password", 
            address="574 Shop Street", 
            xcoord=51.897, 
            ycoord=-8.472, 
            tables=1
        )
        result = self.Publican.reserve_table(10)
        self.assertEqual(result, "No/not enough tables available.")
        self.assertEqual(self.Publican.get_tables(), 1)

    def test_cancel_reservation(self):
        self.Publican.reserve_table(4)
        result = self.Publican.cancel_reservation(4)
        self.assertEqual(result, "Reservation cancelled")
        self.assertEqual(self.Publican.get_tables(), 10)

    def test_cancel_reservation_no_tables_reserved(self):
        result = self.Publican.cancel_reservation(4)
        self.assertEqual(result, "Reservation cancelled")
        self.assertEqual(self.Publican.get_tables(), 10)

    def test_reserve_table_for_multiple_groups(self):
        self.Publican.reserve_table(4)
        result = self.Publican.reserve_table(6)
        self.assertEqual(result, "Table reserved.")
        self.assertEqual(self.Publican.get_tables(), 7)

    def test_reserve_table_for_small_group(self):
        result = self.Publican.reserve_table(2) 
        self.assertEqual(result, "Table reserved.")
        self.assertEqual(self.Publican.get_tables(), 9)

    def test_reserve_table_with_large_group(self):
        result = self.Publican.reserve_table(12)
        self.assertEqual(result, "Table reserved.")
        self.assertEqual(self.Publican.get_tables(), 7)