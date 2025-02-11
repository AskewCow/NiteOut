import uuid  #uuid generates unique gamer_id

# The user account for a player, who has the option to host and play games
class Gamer:
    def __init__(self, name, email, password, gamer_id=None):
        # Generate a unique ID if not provided (e.g., from database)
        self.gamer_id = gamer_id if gamer_id else str(uuid.uuid4())
        self.set_name(name)
        self.set_email(email)
        self.set_password(password)
        self.hosted_games = []         
        self.joined_games = []     

    # Get functions
    def get_gamer_id(self):
        return self.gamer_id
    
    def get_name(self):
        return self.__name
    
    def get_email(self):
        return self.__email
    
    def get_password(self):
        return self.__password
    
    # Set functions
    def set_name(self, name):
        self.__name = name
    
    def set_email(self, email):
        self.__email = email
    
    def set_password(self, password):
        self.__password = password
    
    def host_game(self, game_name):
        self.hosted_games.append(game_name.strip())
    
    def join_game(self, game_name):
        self.joined_games.append(game_name.strip())
    
    def gamerinformation(self):
        return {
            "gamer_id": self.gamer_id,
            "name": self.__name,
            "email": self.__email,
            "hosted_games": self.hosted_games,
            "joined_games": self.joined_games
        }
    

