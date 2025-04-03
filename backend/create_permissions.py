import firebase_admin
from firebase_admin import auth, firestore, credentials

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def create_account_permissions():
    try:
        publican_ref = db.collection('publicans')
        publican_docs = publican_ref.stream()

        for publican in publican_docs:
            publican_data = publican.to_dict()
            email = publican_data.get('email')
            id = publican.id

            perm_ref = db.collection('permissions').document(id)
            existing_perm = perm_ref.get()

            if existing_perm.exists:
                print(f"Skipping existing publican permission {email}.")
                continue  

            publican_perm_data = {
                'can_create_events': True,
                'can_update_details': True,
                'can_create_games': False,
                'can_add_remove_friends': False,
                'can_join_leave_games': False,
                'can_ban_gamers': True,
                'can_delete_games': True,
            }

            perm_ref.set(publican_perm_data)
            print(f"Added new publican permission {email} to Firestore")
        
        gamer_ref = db.collection('gamers')
        gamer_docs = gamer_ref.stream()

        for gamer in gamer_docs:
            gamer_data = gamer.to_dict()
            email = gamer_data.get('email')
            id = gamer.id

            perm_ref = db.collection('permissions').document(id)
            existing_perm = perm_ref.get()

            if existing_perm.exists:
                print(f"Skipping existing gamer permission {email}.")
                continue  

            gamer_perm_data = {
                'can_create_events': False,
                'can_update_details': True,
                'can_create_games': True,
                'can_add_remove_friends': True,
                'can_join_leave_games': True,
                'can_ban_gamers': False,
                'can_delete_games': False,
            }

            perm_ref.set(gamer_perm_data)
            print(f"Added new gamer permission {email} to Firestore")

    except Exception as e:
        print(f"Error creating permissions: {e}")

create_account_permissions()