import firebase_admin
from firebase_admin import credentials, auth, firestore
import random
import string

# Initialize Firebase Admin
cred = credentials.Certificate('serviceAccountKey.json')  # Adjust path if needed
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

def generate_gamer_id():
    """Generate a unique 5-character alphanumeric ID."""
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=5))

def transfer_users_to_firestore():
    """Transfer all authenticated users to the 'gamers' Firestore collection."""
    try:
        page = auth.list_users()
        while page:
            for user in page.users:
                email = user.email
                uid = user.uid
                display_name = user.display_name if user.display_name else "Anonymous"
                gamer_id = generate_gamer_id()

                # Firestore document structure
                gamer_data = {
                    'fullName': display_name,
                    'email': email,
                    'gamerId': gamer_id,
                    'createdAt': firestore.SERVER_TIMESTAMP
                }

                # Write to Firestore in 'gamers' collection
                db.collection('gamers').document(uid).set(gamer_data)
                print(f"Added {email} with Gamer ID {gamer_id} to Firestore.")

            # Move to next page of users
            page = page.get_next_page()
    
    except Exception as e:
        print(f"Error transferring users: {e}")

# Run the transfer function
transfer_users_to_firestore()
