class Game:
    def __init__(self, host, game_name, game_type, date, location, max_players):
        self.set_host(host)
        self.set_game_name(game_name)
        self.set_game_type(game_type)
        self.set_date(date)
        self.set_location(location)
        self.set_max_players(max_players)
        self.__participants = []

    # Get functions
    def get_host(self):
        return self.__host
    
    def get_game_name(self):
        return self.__game_name
    
    def get_game_type(self):
        return self.__game_type
    
    def get_date(self):
        return self.__date
    
    def get_location(self):
        return self.__location

    def get_max_players(self):
        return self.__max_players

    def get_participants(self):
        return self.__participants

    # Set functions
    def set_host(self, host):
        self.__host = host

    def set_game_name(self, game_name):
        self.__game_name = game_name

    def set_game_type(self, game_type):
        self.__game_type = game_type

    def set_date(self, date):
        self.__date = date

    def set_location(self, location):
        self.__location = location

    def set_max_players(self, max_players):
        self.__max_players = max_players

    # Add participant
    def add_participant(self, participant):
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
            "game_type": self.__game_type,
            "date": self.__date,
            "location": self.__location,
            "max_players": self.__max_players,
            "participants": self.__participants
        }
        