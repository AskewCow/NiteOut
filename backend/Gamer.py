# The user account for a player, who has the option to host and play games
class Gamer:
    def __init__(self, name, email, password):
        self.set_name(name)
        self.set_email(email)
        self.set_password(password)
        self.hosted_games = []         
        self.joined_games = []     

    # Get functions
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
        return f"Gamer: {self.__name}, Email: {self.__email}, Hosted Games: {self.hosted_games}, Joined Games: {self.joined_games}"

    

