class Game:
    def __init__(self, host, game_name, game_desc, game_type, start_time, end_time, expires,
                 pub_id, location, xcoord, ycoord, max_players, is_private=False, access_code=None):
        self.set_host(host)
        self.set_game_name(game_name)
        self.set_game_desc(game_desc)
        self.set_game_type(game_type)
        self.set_start_time(start_time)
        self.set_end_time(end_time)
        self.set_expires(expires)
        self.set_pub_id(pub_id)
        self.set_location(location)
        self.set_xcoord(xcoord)
        self.set_ycoord(ycoord)
        self.set_max_players(max_players)
        self.__is_private = is_private
        self.__access_code = access_code
        self.__participants = []

    # Get functions
    def get_host(self): return self.__host  
    def get_game_name(self): return self.__game_name  
    def get_game_desc(self): return self.__game_desc
    def get_game_type(self): return self.__game_type
    def get_start_time(self): return self.__start_time
    def get_end_time(self): return self.__end_time
    def get_expires(self): return self.__expires
    def get_pub_id(self): return self.__pub_id
    def get_location(self): return self.__location
    def get_xcoord(self): return self.__xcoord
    def get_ycoord(self): return self.__ycoord
    def get_max_players(self): return self.__max_players
    def get_participants(self): return self.__participants
    def is_private(self): return self.__is_private
    def get_access_code(self): return self.__access_code

    # Set functions
    def set_host(self, host): self.__host = host
    def set_game_name(self, game_name): self.__game_name = game_name
    def set_game_desc(self, game_desc): self.__game_desc = game_desc
    def set_game_type(self, game_type): self.__game_type = game_type
    def set_start_time(self, start_time): self.__start_time = start_time
    def set_end_time(self, end_time): self.__end_time = end_time
    def set_expires(self, expires): self.__expires = expires
    def set_pub_id(self, pub_id): self.__pub_id = pub_id
    def set_location(self, location): self.__location = location
    def set_xcoord(self, xcoord): self.__xcoord = xcoord
    def set_ycoord(self, ycoord): self.__ycoord = ycoord
    def set_max_players(self, max_players): self.__max_players = max_players
    def set_private(self, is_private): self.__is_private = is_private
    def set_access_code(self, code): self.__access_code = code

    # Add participant
    def add_participant(self, participant, code=None):
        if self.__is_private and self.__access_code != code:
            return "Access denied. Invalid access code."

        if len(self.__participants) < self.__max_players:
            self.__participants.append(participant)
            return f"{participant} has joined the game."
        else:
            return "Game is full."

    # Remove participant
    def remove_participant(self, participant):
        if participant in self.__participants:
            self.__participants.remove(participant)
            return f"{participant} has left the game."
        return "Participant not found."

    # Get game details
    def get_game_details(self):
        return {
            "host": self.__host,
            "game_name": self.__game_name,
            "game_desc": self.__game_desc,
            "game_type": self.__game_type,
            "start_time": self.__start_time,
            "end_time": self.__end_time,
            "pub_id": self.__pub_id,
            "location": self.__location,
            "xcoord": self.__xcoord,
            "ycoord": self.__ycoord,
            "expires": self.__expires,
            "max_players": self.__max_players,
            "participants": self.__participants,
            "is_private": self.__is_private,
            "access_code": self.__access_code
        }


class SeatBasedGame(Game):
    def __init__(self, host, game_name, game_desc, game_type, start_time, end_time, expires,
                 pub_id, location, xcoord, ycoord, max_players, is_private=False, access_code=None):
        super().__init__(host, game_name, game_desc, game_type, start_time, end_time, expires,
                         pub_id, location, xcoord, ycoord, max_players, is_private, access_code)
        self.__seats = {i + 1: None for i in range(max_players)}  # Initialize seats

    # Reserve a specific seat
    def reserve_seat(self, participant, seat_number, code=None):
        if self.is_private() and self.get_access_code() != code:
            return "Access denied. Invalid access code."

        if seat_number not in self.__seats:
            return "Invalid seat number."
        if self.__seats[seat_number] is not None:
            return "Seat already taken."
        if participant in self.get_participants():
            return f"{participant} has already joined the game."
        
        self.__seats[seat_number] = participant
        self.get_participants().append(participant)
        return f"{participant} has reserved seat {seat_number}."

    # Cancel seat reservation
    def cancel_reservation(self, participant):
        for seat, occupant in self.__seats.items():
            if occupant == participant:
                self.__seats[seat] = None
                self.get_participants().remove(participant)
                return f"{participant}'s reservation for seat {seat} has been canceled."
        return "Participant not found."

    # Get seat details
    def get_seat_details(self):
        return self.__seats


class TableBasedGame(Game):
    def __init__(self, host, game_name, game_desc, game_type, start_time, end_time, expires,
                 pub_id, location, xcoord, ycoord, max_players, tables, is_private=False, access_code=None):
        super().__init__(host, game_name, game_desc, game_type, start_time, end_time, expires,
                         pub_id, location, xcoord, ycoord, max_players, is_private, access_code)
        self.__tables = {table: [] for table in tables}  # Initialize tables

    # Reserve a spot at a specific table
    def reserve_table_spot(self, participant, table_name, code=None):
        if self.is_private() and self.get_access_code() != code:
            return "Access denied. Invalid access code."

        if table_name not in self.__tables:
            return "Table not found."
        if len(self.__tables[table_name]) >= (self.get_max_players() // len(self.__tables)):
            return "Table is full."
        if participant in self.get_participants():
            return f"{participant} has already joined the game."

        self.__tables[table_name].append(participant)
        self.get_participants().append(participant)
        return f"{participant} has reserved a spot at {table_name}."

    # Cancel table reservation
    def cancel_table_reservation(self, participant):
        for table, participants in self.__tables.items():
            if participant in participants:
                participants.remove(participant)
                self.get_participants().remove(participant)
                return f"{participant}'s reservation at {table} has been canceled."
        return "Participant not found."

    # Get table details
    def get_table_details(self):
        return self.__tables
