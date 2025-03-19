import firebase_admin
from firebase_admin import auth, firestore, credentials
import random
import string

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def generate_id():
    """Generate a unique 5-character alphanumeric ID."""
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=5))

def transfer_users_to_firestore():
    """Transfer only new authenticated gamers to the 'gamers' Firestore collection."""
    try:
        page_token = None

        while True:
            page = auth.list_users(page_token=page_token)

            for user in page.users:
                email = user.email
                uid = user.uid
                display_name = user.display_name if user.display_name else "Anonymous"

                user_ref = db.collection('gamers').document(uid)
                existing_user = user_ref.get()

                if existing_user.exists:
                    print(f"Skipping existing gamer {email}.")
                    continue  

                gamer_id = generate_id()
                profile = str(random.randint(1, 12)).zfill(2)

                gamer_data = {
                    'fullName': display_name,
                    'email': email,
                    'gamerId': gamer_id,
                    'profile': profile,
                    'friends_list': [],
                    'hosted_games': [],
                    'joined_games': [],
                    'createdAt': firestore.SERVER_TIMESTAMP
                }

                user_ref.set(gamer_data)
                print(f"Added new gamer {email} to Firestore with Gamer ID {gamer_id}.")

            page_token = page.next_page_token
            if not page_token:
                break

    except Exception as e:
        print(f"Error transferring gamers: {e}")

def transfer_publicans_to_firestore():
    """Transfer only new authenticated publicans to the 'users' Firestore collection."""
    try:
        page_token = None

        while True:
            page = auth.list_users(page_token=page_token)

            for user in page.users:
                email = user.email
                uid = user.uid
                display_name = user.display_name if user.display_name else "Anonymous"

                user_ref = db.collection('users').document(uid)
                existing_user = user_ref.get()

                if existing_user.exists:
                    print(f"Skipping existing publican {email}.")
                    continue 

                publican_id = generate_id()
                venue = "Unknown Venue"

                publican_data = {
                    'fullName': display_name,
                    'email': email,
                    'publicanId': publican_id,
                    'venue': venue,
                    'hosted_events': [],
                    'createdAt': firestore.SERVER_TIMESTAMP
                }

                user_ref.set(publican_data)
                print(f"Added new publican {email} to Firestore with Publican ID {publican_id}.")

            page_token = page.next_page_token
            if not page_token:
                break

    except Exception as e:
        print(f"Error transferring publicans: {e}")

# Run both functions
transfer_users_to_firestore()
transfer_publicans_to_firestore()
