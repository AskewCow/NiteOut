import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Gamer import Gamer

@pytest.mark.xfail
def test_fail_add_friend_twice():
    # This test is intended to fail because adding the same friend twice should not succeed.
    gamer = Gamer("Eve", "eve@example.com", "pass789", "02")
    friend_id = "FRIEND1"
    result_first = gamer.add_friend(friend_id)
    result_second = gamer.add_friend(friend_id)
    assert result_second is True, "Expected adding the same friend twice to succeed, but it did not."

@pytest.mark.xfail
def test_fail_remove_nonexistent_friend():
    # This test is intended to fail because trying to remove a non-existent friend should return False.
    gamer = Gamer("Frank", "frank@example.com", "pass101", "07")
    result = gamer.remove_friend("NON_EXISTENT")
    assert result is True, "Expected removal of a non-existent friend to return True, but it returned False."

@pytest.mark.xfail
def test_fail_unique_gamer_ids():
    # This test is intended to fail because it expects two different gamers to have the same ID.
    gamer1 = Gamer("Grace", "grace@example.com", "pass202", "06")
    gamer2 = Gamer("Hank", "hank@example.com", "pass303", "08")
    assert gamer1.get_gamer_id() == gamer2.get_gamer_id(), "Expected both gamers to have the same ID, but they are unique."
