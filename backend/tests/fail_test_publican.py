import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Publican import Publican

@pytest.mark.xfail
def test_fail_cancel_reservation():
    """
    This test is intended to fail because the cancel_reservation method always returns
    a success message, but the test asserts an error message.
    """
    pub = Publican("Pub D", "pubd@example.com", "ID004", "password111", "111 Street", 12.0, 22.0, 5)
    result = pub.cancel_reservation(2) 
    # Intentionally expecting an error message even though cancellation always succeeds.
    assert result["message"] == "Reservation cancellation failed.", \
        "Expected cancel reservation to fail, but it succeeded."

@pytest.mark.xfail
def test_fail_encode_image_success():
    """
    This test is intended to fail because encode_image with a non-existent file returns
    an error status, but the test asserts a success status.
    """
    pub = Publican("Pub E", "pube@example.com", "ID005", "password222", "222 Avenue", 15.0, 25.0, 10)
    result = pub.encode_image("non_existent_image.png")
    # Intentionally expecting a success status even though the file does not exist.
    assert result["status"] == "success", "Expected image encoding to succeed, but it failed."

@pytest.mark.xfail
def test_fail_pub_details_missing_password():
    """
    This test is intended to fail because pub_details includes the password in its output,
    but the test asserts that the 'password' key should not be present.
    """
    pub = Publican("Pub F", "pubf@example.com", "ID006", "password333", "333 Blvd", 18.0, 28.0, 8)
    details = pub.pub_details()
    # Intentionally asserting that 'password' should be omitted.
    assert "password" not in details, "Expected pub details to not contain 'password', but it does."

@pytest.mark.xfail
def test_fail_create_table_event_without_capacity():
    """
    This test is intended to fail because when creating a 'Table Based' event without supplying
    unit_capacity, the method still sets table_capacity (possibly to None). The test asserts that
    table_capacity must not be None.
    """
    pub = Publican("Pub G", "pubg@example.com", "ID007", "password444", "444 Road", 20.0, 30.0, 6)
    result = pub.create_event("Table Based", "19:00", "22:00", "23:00", 4, available_slots=4)
    # Intentionally expecting table_capacity to be non-None.
    assert result["event"].get("table_capacity") is not None, \
        "Expected table_capacity to be set for a Table Based event, but it is None."
