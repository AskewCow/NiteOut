import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateProfile, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Keyboard,
  Alert,
} from "react-native";

// Firebase Imports
import { auth, db } from "../firebaseConfig";

const SignUpScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setEmailError(""); // Reset email error
      setPasswordError(""); // Reset password error
    });
    // Cleanup the listener when the component unmounts or on focus change
    return unsubscribe;
  }, [navigation]);

  const checkIfEmailExists = async (email) => {
    try {
      const querySnapshot = await db
        .collection("users")
        .where("email", "==", email)
        .get();
      return !querySnapshot.empty; // returns true if the email exists
    } catch (error) {
      console.error("Error checking email in Firestore:", error);
      return false;
    }
  };

  const handleSignUp = async () => {
    // Reset errors when user starts new input
    setFullNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    // Validate Full Name
    if (!trimmedFullName) {
      setFullNameError("*Full Name is required.");
      return;
    }
    if (trimmedFullName.split(" ").length < 2) {
      setFullNameError("*Must include forename and surname.");
      return;
    }

    // Validate Email
    if (!trimmedEmail) {
      setEmailError("*Email is required.");
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    // Check if email exists in Firestore (without creating user yet)
    const emailExists = await checkIfEmailExists(trimmedEmail);
    if (emailExists) {
      setEmailError("Email already in use. Please try another one.");
      return;
    }

    // Validate Password
    if (!password) {
      setPasswordError("*Password is required.");
      return;
    }

    // Validate Confirm Password
    if (!confirmPassword) {
      setConfirmPasswordError("*Please confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match!");
      return;
    }

    try {
      console.log("Attempting to create user with email:", trimmedEmail);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password,
      );
      const user = userCredential.user;

      console.log("User created:", user);
      await updateProfile(user, { displayName: fullName });
      console.log("Display name updated in Firebase Auth:", user.displayName);

      // Retrieve gamerId from AsyncStorage
      const gamerId = await AsyncStorage.getItem("gamerId");

      // Conditional navigation based on gamerId
      if (gamerId) {
        navigation.navigate("PfpChoice", { gamerId });
      } else {
        Alert.alert("Please log in again.");
        navigation.navigate("LoginScreen");
      }
      const randomProfileId = String(
        Math.floor(Math.random() * 12) + 1,
      ).padStart(2, "0");

      // Save user data to Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          fullName,
          email: trimmedEmail,
          profile: randomProfileId,
          friends_list: [],
          hosted_games: [],
          joined_games: [],
          createdAt: new Date(),
        });
        console.log("User data saved to Firestore");
      } catch (firestoreError) {
        console.error("Firestore write error:", firestoreError);
      }
    } catch (error) {
      console.error("Error during sign-up:", error);

      if (error.code === "auth/weak-password") {
        setPasswordError("Password is too weak! Try a stronger one.");
      } else if (error.code === "auth/invalid-email") {
        setEmailError("Invalid email format.");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={[styles.section, styles.backgroundBlue]} />
        <View style={[styles.section, styles.backgroundLightBlue]} />
        <View style={[styles.section, styles.backgroundWhite]} />

        {/* Form Container */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Sign up and start playing</Text>

          {/* Full Name Error */}
          <View style={{ minHeight: 17 }}>
            {fullNameError ? (
              <Text style={styles.errorText}>{fullNameError}</Text>
            ) : null}
          </View>

          {/* Full Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email Error */}
          <View style={{ minHeight: 17 }}>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => setEmail(text.trim())}
          />

          {/* Password Error */}
          <View style={{ minHeight: 17 }}>
            {passwordError ? (
              <Text
                style={
                  passwordError.includes("required")
                    ? styles.errorText
                    : styles.weakPasswordText
                }
              >
                {passwordError}
              </Text>
            ) : null}
          </View>

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Confirm Password Error Message */}
          <View style={{ minHeight: 17 }}>
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}
          </View>

          {/* Confirm Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Sign Up as Publican Button */}
          <TouchableOpacity
            style={styles.publicanButton}
            onPress={() => navigation.navigate("PublicanSignUp")}
          >
            <Text style={styles.publicanText}>Sign up as Publican</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen")}
            >
              <Text style={styles.signInLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00B4D8",
  },
  section: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  backgroundBlue: {
    height: "100%",
    top: 0,
    backgroundColor: "#00B4D8",
  },
  backgroundLightBlue: {
    height: "100%",
    top: "2%",
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    backgroundColor: "#90E0EF",
  },
  backgroundWhite: {
    height: "100%",
    top: "19%",
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    backgroundColor: "#f8f9fa",
  },
  formContainer: {
    margin: 10,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    top: "4%",
  },
  title: {
    fontSize: 28,
    color: "#212529",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#212529",
    textAlign: "center",
    marginBottom: "17%",
  },
  input: {
    height: 55,
    backgroundColor: "#eef0f2",
    borderRadius: 13,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginLeft: 5,
    marginBottom: 5,
  },
  weakPasswordText: {
    color: "orange",
    fontSize: 14,
    marginLeft: 5,
    marginBottom: 5,
  },
  signUpButton: {
    backgroundColor: "#FF007A",
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
    marginTop: "5%",
  },
  signUpText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: "2%",
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#FF007A",
  },
  separatorText: {
    marginHorizontal: "5%",
    color: "#FF007A",
    fontWeight: "bold",
    fontSize: 14,
  },
  publicanButton: {
    backgroundColor: "#fbdbe9",
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  publicanText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5%",
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  signInLink: {
    color: "#FF007A",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default SignUpScreen;
