import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Keyboard,
  Alert,
  InteractionManager,
} from "react-native";

import { updateProfile } from "firebase/auth";

// Firebase Imports
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const SignUpScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();

    if (!validateEmail(trimmedEmail)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      console.log("Attempting to create user with email:", trimmedEmail);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      const user = userCredential.user;

      console.log("User created:", user);
      await updateProfile(user, { displayName: fullName });
      console.log("Display name updated in Firebase Auth:", user.displayName);

      InteractionManager.runAfterInteractions(async () => {
        Alert.alert("Success", "Account created successfully! Please log in.");
        navigation.navigate("Login");
      });

      try {
        await setDoc(doc(db, "users", user.uid), {
          fullName: fullName,
          email: trimmedEmail,
          createdAt: new Date(),
        });
        console.log("User data saved to Firestore");
      } catch (firestoreError) {
        console.error("Firestore write error:", firestoreError);
      }
    } catch (error) {
      console.error("Error during sign-up:", error);
      Alert.alert("Error", error.message);
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

          {/* Full Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => setEmail(text.trim())}
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

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
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.signInLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#00B4D8" },
  section: { position: "absolute", left: 0, right: 0 },
  backgroundBlue: { height: "100%", top: 0, backgroundColor: "#00B4D8" },
  backgroundLightBlue: {
    height: "100%",
    top: "3%",
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    backgroundColor: "#90E0EF",
  },
  backgroundWhite: {
    height: "100%",
    top: "20%",
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    backgroundColor: "#f8f9fa",
  },
  formContainer: {
    margin: 10,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    top: "5%",
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
    marginBottom: 80,
  },
  input: {
    height: 55,
    backgroundColor: "#eef0f2",
    borderRadius: 13,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  signUpButton: {
    backgroundColor: "#FF007A",
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
    marginTop: "5%",
  },
  signUpText: { color: "white", fontWeight: "bold", fontSize: 16 },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: "2%",
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: "#FF007A" },
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
  publicanText: { color: "black", fontWeight: "bold", fontSize: 16 },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5%",
  },
  footerText: { color: "#666", fontSize: 14 },
  signInLink: { color: "#FF007A", fontWeight: "bold", fontSize: 14 },
});

export default SignUpScreen;
