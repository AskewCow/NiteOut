from firebase_functions import auth_fn
from firebase_admin import initialize_app, firestore
import random
import string

# Initialize Firebase Admin
initialize_app()

# Initialize Firestore
db = firestore.client()

def generate_gamer_id():
    """Generate a unique 5-character alphanumeric ID."""
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=5))

@auth_fn.on_user_created()
def add_user_to_gamers(event):
    """Trigger when a new user signs up to add them to the 'gamers' collection."""
    user = event.data

    email = user.get('email', 'no-email@example.com')
    display_name = user.get('displayName', 'Anonymous')

    gamer_data = {
        'fullName': display_name,
        'email': email,
        'gamerId': generate_gamer_id(),
        'createdAt': firestore.SERVER_TIMESTAMP
    }

    # Add user data to the 'gamers' collection in Firestore
    db.collection('gamers').document(user['uid']).set(gamer_data)

    print(f"Added {email} to the gamers collection with Gamer ID {gamer_data['gamerId']}.")
