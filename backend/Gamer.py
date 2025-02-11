import random
import string

class Gamer:
    __existing_ids = set()  # Class variable to track existing IDs

    def __init__(self, name, email, password):
        self.__gamer_id = self.__generate_unique_id() 
        self.set_name(name)
        self.set_email(email)
        self.set_password(password)
        self.hosted_games = []         
        self.joined_games = []     
        self.friends_list = []

    def __generate_unique_id(self):
        while True:
            # Generate 5 random characters from letters and digits
            characters = string.ascii_uppercase + string.digits  # A-Z and 0-9
            new_id = ''.join(random.choice(characters) for _ in range(5))
            if new_id not in Gamer.__existing_ids:
                Gamer.__existing_ids.add(new_id)
                return new_id

    # Get functions
    def get_gamer_id(self):
        return self.__gamer_id

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
    
    def add_friend(self, friend_gamer_id):
        if friend_gamer_id not in self.friends_list:
            self.friends_list.append(friend_gamer_id)
            return True
        return False
    
    def remove_friend(self, friend_gamer_id):
        if friend_gamer_id in self.friends_list:
            self.friends_list.remove(friend_gamer_id)
            return True
        return False