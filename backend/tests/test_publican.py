import pytest
from unittest.mock import mock_open, patch
import base64

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Publican import Publican

# Test Publican class initialization
def test_publican_initialization():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 10)

    assert publican.pub_name == "Pub A"
    assert publican.email == "pub@example.com"
    assert publican.ID == "PUB001"
    assert publican.password == "securepassword"
    assert publican.address == "123 Street, Dublin"
    assert publican.xcoord == 53.349805
    assert publican.ycoord == -6.26031
    assert publican.tables == 10
    assert publican.events == []
    assert publican.pub_image is None

# Test event creation
def test_create_event_seat_based():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 10)
    
    response = publican.create_event("Seat Based", "18:00", "21:00", "23:59", 20)
    
    assert response["status"] == "success"
    assert response["event"]["game_type"] == "Seat Based"
    assert response["event"]["num_units"] == 20
    assert len(publican.events) == 1

def test_create_event_table_based():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 10)
    
    response = publican.create_event("Table Based", "19:00", "22:00", "23:59", 5, unit_capacity=4)
    
    assert response["status"] == "success"
    assert response["event"]["game_type"] == "Table Based"
    assert response["event"]["table_capacity"] == 4
    assert len(publican.events) == 1

def test_create_event_invalid_type():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 10)
    
    response = publican.create_event("Invalid Type", "18:00", "21:00", "23:59", 20)
    
    assert response["status"] == "error"
    assert "Invalid game type" in response["message"]

# Test table reservation
def test_reserve_tables_success():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 10)
    
    response = publican.reserve_tables(5)
    
    assert response["status"] == "success"
    assert publican.tables == 5

def test_reserve_tables_not_enough():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 3)
    
    response = publican.reserve_tables(5)
    
    assert response["status"] == "error"
    assert "Not enough tables available" in response["message"]
    assert publican.tables == 3  # Tables remain unchanged

# Test reservation cancellation
def test_cancel_reservation():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 5)
    
    response = publican.cancel_reservation(2)
    
    assert response["status"] == "success"
    assert publican.tables == 7  # 5 + 2

# Test updating pub image
def test_update_pub_image():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 10)
    
    response = publican.update_pub_image("new_image.png")
    
    assert response["status"] == "success"
    assert publican.pub_image == "new_image.png"

# Test encoding an image (Mocked)
def test_encode_image():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 10)

    mock_data = b"test_image"
    with patch("builtins.open", mock_open(read_data=mock_data)) as mock_file:
        encoded_image = publican.encode_image("test_image.png")
        mock_file.assert_called_once_with("test_image.png", "rb")
    
    assert encoded_image == base64.b64encode(mock_data).decode("utf-8")


# Test encoding a non-existent image
def test_encode_image_not_found():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 10)
    
    response = publican.encode_image("non_existent.png")
    
    assert response["status"] == "error"
    assert "Image file not found" in response["message"]

# Test getting pub details
def test_pub_details():
    publican = Publican("Pub A", "pub@example.com", "PUB001", "securepassword", "123 Street, Dublin", 53.349805, -6.26031, 10)
    
    details = publican.pub_details()
    
    assert details["pub_name"] == "Pub A"
    assert details["email"] == "pub@example.com"
    assert details["tables"] == 10
    assert details["events"] == []
    assert details["pub_image"] is None
