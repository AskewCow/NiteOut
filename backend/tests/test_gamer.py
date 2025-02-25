import pytest

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from gamer import Gamer

def test_gamer_initialization_valid_profile():
    name = "Alice"
    email = "alice@example.com"
    password = "securepassword"
    profile = "05"
    gamer = Gamer(name, email, password, profile)
    
    # Check basic attributes
    assert gamer.get_name() == name
    assert gamer.get_email() == email
    assert gamer.get_password() == password
    assert gamer.get_profile() == profile
    # Verify the profile path formatting
    assert gamer.get_profile_path() == f"/static/icons/{profile}.svg"
    
    # Ensure game lists are empty upon initialization
    assert gamer.hosted_games == []
    assert gamer.joined_games == []
    assert gamer.friends_list == []

def test_gamer_invalid_profile():
    name = "Bob"
    email = "bob@example.com"
    password = "anotherpassword"
    invalid_profile = "13"  # Outside the valid range '01' to '12'
    with pytest.raises(ValueError) as excinfo:
        Gamer(name, email, password, invalid_profile)
    assert "Invalid profile ID" in str(excinfo.value)

def test_host_and_join_game():
    gamer = Gamer("Charlie", "charlie@example.com", "pass123", "02")
    # Test host_game: input with extra whitespace should be stripped
    gamer.host_game("   Fun Game   ")
    assert gamer.hosted_games == ["Fun Game"]
    
    # Test join_game: ensure the game name is stored correctly after stripping
    gamer.join_game("  Adventure Quest")
    assert gamer.joined_games == ["Adventure Quest"]

def test_add_and_remove_friend():
    gamer = Gamer("Dana", "dana@example.com", "pass456", "03")
    friend_id = "FRIEND1"
    
    # Adding a new friend should succeed
    assert gamer.add_friend(friend_id) is True
    # Trying to add the same friend again should fail
    assert gamer.add_friend(friend_id) is False
    
    # Removing an existing friend should succeed
    assert gamer.remove_friend(friend_id) is True
    # Removing a non-existent friend should fail
    assert gamer.remove_friend(friend_id) is False

def test_to_dict():
    name = "Eve"
    email = "eve@example.com"
    password = "pass789"
    profile = "04"
    gamer = Gamer(name, email, password, profile)
    
    # Add some sample data
    gamer.host_game("Poker Night")
    gamer.join_game("Chess Tournament")
    gamer.add_friend("FRIEND2")
    
    gamer_dict = gamer.to_dict()
    
    # Verify all dictionary entries
    assert gamer_dict["name"] == name
    assert gamer_dict["email"] == email
    assert gamer_dict["password"] == password
    assert gamer_dict["profile"] == f"/static/icons/{profile}.svg"
    assert gamer_dict["hosted_games"] == ["Poker Night"]
    assert gamer_dict["joined_games"] == ["Chess Tournament"]
    assert gamer_dict["friends_list"] == ["FRIEND2"]
    
    # Check that a unique gamer_id is present and appears correctly formatted
    gamer_id = gamer_dict["gamer_id"]
    assert isinstance(gamer_id, str)
    assert len(gamer_id) == 5

def test_unique_gamer_ids():
    # Create two Gamer instances and ensure their IDs are unique
    gamer1 = Gamer("Frank", "frank@example.com", "pass1", "06")
    gamer2 = Gamer("Grace", "grace@example.com", "pass2", "07")
    assert gamer1.get_gamer_id() != gamer2.get_gamer_id()





