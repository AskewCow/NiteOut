class Publican:
    def __init__(self, pub_name, email, ID, password, address, xcoord, ycoord, tables):
        self.pub_name = pub_name
        self.email = email
        self.ID = ID
        self.password = password
        self.address = address
        self.xcoord = xcoord
        self.ycoord = ycoord
        self.tables = tables
        self.events = []

    def create_event(self, game_type, start_time, end_time, expires, num_units, unit_capacity=None, available_slots=None):
        if game_type not in ["Seat Based", "Table Based"]:
            return {"status": "error", "message": "Invalid game type specified."}

        event = {
            "game_type": game_type,
            "start_time": start_time,
            "end_time": end_time,
            "expires": expires,
            "num_units": num_units,
            "available_slots": available_slots
        }
        if game_type == "Table Based":
            event["table_capacity"] = unit_capacity

        self.events.append(event)
        return {"status": "success", "event": event}

    def reserve_tables(self, num_tables):
        if self.tables >= num_tables:
            self.tables -= num_tables
            return {"status": "success", "message": "Table reserved."}
        else:
            return {"status": "error", "message": "Not enough tables available."}

    def cancel_reservation(self, num_tables):
        self.tables += num_tables
        return {"status": "success", "message": "Reservation cancelled."}

    def pub_details(self):
        return {
            "name": self.pub_name,
            "email": self.email,
            "ID": self.ID,
            "password": self.password,
            "address": self.address,
            "xcoord": self.xcoord,
            "ycoord": self.ycoord,
            "tables": self.tables,
            "events": self.events
        }
