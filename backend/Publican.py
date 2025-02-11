# The user account for the owner of a pub, who would reserve tables for use in game nights
class Publican:
    def __init__(self, pub_name, email, ID, password, address, xcoord, ycoord, tables):
        self.set_pub_name(pub_name)
        self.set_email(email)
        # ID is current placeholder for pub verification (NOT THE SAME AS THE API ID), that is lowercase id
        self.set_ID(ID)
        self.set_password(password)
        self.set_address(address)
        self.set_xcoord(xcoord)
        self.set_ycoord(ycoord)
        self.set_tables(tables)

    # Get functions
    def get_pub_name(self):
        return self.__pubName
    
    def get_email(self):
        return self.__email
    
    def get_ID(self):
        return self.__ID
    
    def get_address(self):
        return self.__address
    
    def get_password(self):
        return self.__password
    
    def get_xcoord(self):
        return self.__xcoord
    
    def get_ycoord(self):
        return self.__ycoord
    
    def get_tables(self):
        return self.__tables
    
    # Set functions
    def set_pub_name(self, pub_name):
        self.__pub_name = pub_name
    
    def set_email(self, email):
        self.__email = email
    
    def set_ID(self, ID):
        self.__ID = ID
    
    def set_password(self, password):
        self.__password = password
    
    def set_address(self, address):
        self.__address = address

    def set_xcoord(self, xcoord):
        self.__xcoord = xcoord

    def set_ycoord(self, ycoord):
        self.__ycoord = ycoord
    
    def set_tables(self, tables):
        self.__tables = tables

    # Reserve tables based on number of players, current functionality only for one day
    def reserve_table(self, max_players):
        # division will always round up
        table_count = int(max_players / 4) + (max_players % 5 > 0)
        if (table_count > self.__tables):
            self.__tables -= table_count
            return "Table reserved."
        else:
            return "No/not enough tables available."
        
    # Cancel a table reservation
    def cancel_reservation(self, max_players):
        table_count = int(max_players / 4) + (max_players % 5 > 0)
        self.__tables += table_count
        return "Reservation cancelled"
    
    def pub_details(self):
        return {
            "name": self.__pub_name,
            "email": self.__email,
            "ID(verification)": self.__ID,
            "password": self.__password,
            "address": self.__address,
            "xcoord": self.__xcoord,
            "ycoord": self.__ycoord,
            "tables": self.__tables
        }

