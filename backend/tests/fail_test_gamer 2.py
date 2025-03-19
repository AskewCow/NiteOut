import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Gamer import Gamer

@pytest.mark.xfail
def test_fail_add_friend_twice():
    """
    This test is intended to fail because adding the same friend twice should not succeed.
    The correct behavior is that the first addition succeeds, while the second attempt returns False.
    """
    gamer = Gamer("Eve", "eve@example.com", "pass789", "02")
    friend_id = "FRIEND1"
    result_first = gamer.add_friend(friend_id)
    result_second = gamer.add_friend(friend_id)
    expected_message = False  # Second addition should fail
    assert result_second == expected_message, f"Expected result: '{expected_message}', but got '{result_second}'."

@pytest.mark.xfail
def test_fail_remove_nonexistent_friend():
    """
    This test is intended to fail because trying to remove a non-existent friend should return False.
    The correct behavior is that removal of a non-existent friend should fail.
    """
    gamer = Gamer("Frank", "frank@example.com", "pass101", "07")
    result = gamer.remove_friend("NON_EXISTENT")
    expected_message = False  # Removal should fail
    assert result == expected_message, f"Expected result: '{expected_message}', but got '{result}'."

@pytest.mark.xfail
def test_fail_unique_gamer_ids():
    """
    This test is intended to fail because it expects two different gamers to have the same ID.
    The correct behavior is that each gamer gets a unique ID.
    """
    gamer1 = Gamer("Grace", "grace@example.com", "pass202", "06")
    gamer2 = Gamer("Hank", "hank@example.com", "pass303", "08")
    expected_message = False  # Gamer IDs should be unique
    assert gamer1.get_gamer_id() == gamer2.get_gamer_id(), f"Expected both gamers to have the same ID, but got '{gamer1.get_gamer_id()}' and '{gamer2.get_gamer_id()}'."