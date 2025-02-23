import base64

class Publican:
    def __init__(self, pub_name, email, ID, password, address, xcoord, ycoord, tables, pub_image=None):
        self.pub_name = pub_name
        self.email = email
        self.ID = ID
        self.password = password
        self.address = address
        self.xcoord = xcoord
        self.ycoord = ycoord
        self.tables = tables
        self.events = []
        self.pub_image = pub_image

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

    def update_pub_image(self, new_image):
        """ can be a file path, Base64 string, or URL) """
        self.pub_image = new_image
        return {"status": "success", "message": "Pub image updated."}

    def encode_image(self, image_path):
        try:
            with open(image_path, "rb") as img_file:
                return base64.b64encode(img_file.read()).decode("utf-8")
        except FileNotFoundError:
            return {"status": "error", "message": "Image file not found."}


    def pub_details(self):
        return {
            "pub_name": self.pub_name,
            "email": self.email,
            "ID": self.ID,
            "password": self.password,
            "address": self.address,
            "xcoord": self.xcoord,
            "ycoord": self.ycoord,
            "tables": self.tables,
            "events": self.events,
            "pub_image": self.pub_image 
        }
