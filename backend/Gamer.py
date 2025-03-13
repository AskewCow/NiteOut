import random
import string
import firebase_admin
from firebase_admin import credentials, firestore

#Initialize Firebase Admin SDK
#cred = credentials.Certificate("serviceAccountKey.json")
#firebase_admin.initialize_app(cred)
#db = firestore.client()

class Gamer:
    __existing_ids = set()

    def __init__(self, name, email, password, profile):
        self.__gamer_id = self.__generate_unique_id() 
        self.set_name(name)
        self.set_email(email)
        self.set_password(password)
        self.set_profile(profile if profile else self.__random_profile())
        self.hosted_games = []         
        self.joined_games = []     
        self.friends_list = []
    
    def __random_profile(self):
        return str(random.randint(1, 12)).zfill(2)

    def __generate_unique_id(self):
        while True:
            characters = string.ascii_uppercase + string.digits
            new_id = ''.join(random.choice(characters) for _ in range(5))
            if new_id not in Gamer.__existing_ids:
                Gamer.__existing_ids.add(new_id)
                return new_id

    def to_dict(self):
        return {
            'gamer_id': self.get_gamer_id(),
            'name': self.get_name(),
            'email': self.get_email(),
            'password': self.get_password(),
            'profile': self.get_profile_path(),
            'hosted_games': self.hosted_games,
            'joined_games': self.joined_games,
            'friends_list': self.friends_list
        }
    
    def get_profile_path(self):
        return f"/static/icons/{self.__profile}.svg"

    # Get functions
    def get_gamer_id(self):
        return self.__gamer_id

    def get_name(self):
        return self.__name
    
    def get_email(self):
        return self.__email
    
    def get_password(self):
        return self.__password
    
    def get_profile(self):
        return self.__profile
    
    # Set functions
    def set_name(self, name):
        self.__name = name
    
    def set_email(self, email):
        self.__email = email
    
    def set_password(self, password):
        self.__password = password

    def set_profile(self, profile):
        if profile in [str(i).zfill(2) for i in range(1, 13)]: 
            self.__profile = profile
        else:
            raise ValueError("Invalid profile ID. Choose between '01' and '12'.")
    
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
    
    
