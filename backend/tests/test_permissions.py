import pytest

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from permissions import Permissions

class Gamer:
    pass

class Publican:
    pass

def test_permissions_player():
    # Create a Gamer instance and initialize Permissions
    player = Gamer()
    perms = Permissions(player)
    
    # Check that role is set to "player" and corresponding permissions are True
    assert perms.get_role() == "player"
    assert perms.can_host_game() is True
    assert perms.can_join_game() is True
    assert perms.can_manage_friends() is True

def test_permissions_publican():
    # Create a Publican instance and initialize Permissions
    publican = Publican()
    perms = Permissions(publican)
    
    # Check that role is set to "publican" and corresponding permissions are False
    assert perms.get_role() == "publican"
    assert perms.can_host_game() is False
    assert perms.can_join_game() is False
    assert perms.can_manage_friends() is False

def test_permissions_invalid_user():
    # Passing an invalid user type should raise a ValueError
    with pytest.raises(ValueError) as excinfo:
        Permissions("invalid_user")
    assert "Invalid user type" in str(excinfo.value)
