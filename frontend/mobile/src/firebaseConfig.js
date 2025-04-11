import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsXXjAFlESkikhj7aWi3hs7vFlrNj3soQ",
  projectId: "niteout-49dc5",
  storageBucket: "niteout-storage-49dc5",
  appId: "1:77171862574:ios:09ee78bf87992d1d2103bf",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
