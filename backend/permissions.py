class Permissions:
    def __init__(self, role='player'):
        self.__role = role.lower()
        self.__permissions = {
            'publicant': {
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

    def set_role(self, new_role):
        if new_role.lower() in self.__permissions:
            self.__role = new_role.lower()
        else:
            raise ValueError("Invalid role. Choose 'publicant' or 'player'.")

    def can_host_game(self):
        return self.__permissions[self.__role]['can_host_game']

    def can_join_game(self):
        return self.__permissions[self.__role]['can_join_game']

    def can_manage_friends(self):
        return self.__permissions[self.__role]['can_manage_friends']
