import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from permissions import Permissions

# Dummy classes to simulate user types
class Gamer:
    pass

class Publican:
    pass

def test_fail_wrong_role_for_gamer():
    """
    This test is intended to fail because it expects a Gamer to have the role 'publican'
    instead of the correct 'player'.
    """
    gamer = Gamer()
    perms = Permissions(gamer)
    # Correct role for Gamer is "player", but we're asserting it should be "publican"
    assert perms.get_role() == "publican", f"Expected role 'publican' but got '{perms.get_role()}'"

def test_fail_wrong_permissions_for_gamer():
    """
    This test is intended to fail because it expects a Gamer's permission to host a game
    to be False, even though it should be True.
    """
    gamer = Gamer()
    perms = Permissions(gamer)
    # Correctly, can_host_game() returns True for a Gamer.
    assert perms.can_host_game() is False, "Expected can_host_game to be False for a Gamer, but it is True."

def test_fail_wrong_permissions_for_publican():
    """
    This test is intended to fail because it expects a Publican's permission to join a game
    to be True, even though it should be False.
    """
    publican = Publican()
    perms = Permissions(publican)
    # Correctly, can_join_game() returns False for a Publican.
    assert perms.can_join_game() is True, "Expected can_join_game to be True for a Publican, but it is False."

def test_fail_invalid_user_no_error():
    """
    This test is intended to fail because it expects that creating a Permissions instance with
    an invalid user type does NOT raise an error, even though it should raise a ValueError.
    """
    try:
        # This call should raise a ValueError.
        Permissions("InvalidUser")
    except ValueError:
        pytest.fail("Expected no ValueError for an invalid user, but a ValueError was raised.")
