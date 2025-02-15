import firebase_admin
from firebase_admin import auth, firestore, credentials
import random
import string

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def generate_gamer_id():
    """Generate a unique 5-character alphanumeric ID."""
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=5))

def transfer_users_to_firestore():
    """Transfer all authenticated users to the 'gamers' Firestore collection while preserving existing data."""
    try:
        page_token = None

        while True:
            # Get list of users, paginated
            page = auth.list_users(page_token=page_token)

            for user in page.users:
                email = user.email
                uid = user.uid
                display_name = user.display_name if user.display_name else "Anonymous"

                # Reference the Firestore document
                user_ref = db.collection('gamers').document(uid)
                existing_user = user_ref.get()

                if existing_user.exists:
                    existing_data = existing_user.to_dict()
                    gamer_id = existing_data.get('gamerId', generate_gamer_id())  # Keep existing gamer ID
                    profile = existing_data.get('profile', str(random.randint(1, 12)).zfill(2))  # Keep existing profile
                    friends_list = existing_data.get('friends_list', [])  # Keep existing friends
                    hosted_games = existing_data.get('hosted_games', [])  # Keep hosted games
                    joined_games = existing_data.get('joined_games', [])  # Keep joined games
                else:
                    # If user doesn't exist, assign a new gamer ID and profile
                    gamer_id = generate_gamer_id()
                    profile = str(random.randint(1, 12)).zfill(2)
                    friends_list = []
                    hosted_games = []
                    joined_games = []

                # Updated Firestore document structure
                gamer_data = {
                    'fullName': display_name,
                    'email': email,
                    'gamerId': gamer_id,  # Preserving or setting new one
                    'profile': profile,  # Keep or assign a random one
                    'friends_list': friends_list,  # Preserve friends
                    'hosted_games': hosted_games,  # Preserve hosted games
                    'joined_games': joined_games,  # Preserve joined games
                    'createdAt': firestore.SERVER_TIMESTAMP
                }

                # Use set() with merge=True to avoid overwriting existing data
                user_ref.set(gamer_data, merge=True)
                print(f"✅ Updated {email} in Firestore with Gamer ID {gamer_id}.")

            # Check if there are more users to fetch
            page_token = page.next_page_token
            if not page_token:
                break  # No more pages, exit the loop

    except Exception as e:
        print(f"❌ Error transferring users: {e}")

# Run the function
transfer_users_to_firestore()
