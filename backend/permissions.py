class Permissions:
    def __init__(self, user):
        if isinstance(user, Gamer):
            self.__role = "player"
        elif isinstance(user, Publican):
            self.__role = "publican"
        else:
            raise ValueError("Invalid user type. Must be a Gamer or Publican instance.")

        self.__permissions = {
            'publican': {
                'can_host_game': False,
                'can_join_game': False,
                'can_manage_friends': False
            },
            'player': {
                'can_host_game': True,
                'can_join_game': True,
                'can_manage_friends': True
            }
        }

    def get_role(self):
        return self.__role

    def can_host_game(self):
        return self.__permissions[self.__role]['can_host_game']

    def can_join_game(self):
        return self.__permissions[self.__role]['can_join_game']

    def can_manage_friends(self):
        return self.__permissions[self.__role]['can_manage_friends']

