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
} from "react-native";

// Firebase Imports
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

// AsyncStorage Import
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      // Store the user's UID (gamerId) in AsyncStorage
      await AsyncStorage.setItem("gamerId", user.uid);
      console.log("Gamer ID stored successfully:", user.uid);

      // Navigate to the MainScreen only after storing the gamerId
      navigation.navigate("Main");
    } catch (error) {
      console.error("Error during login:", error);

      // Handling specific Firebase auth errors
      if (error.code === "auth/user-not-found") {
        Alert.alert("Error", "No user found with this email.");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert(
          "Error",
          "Invalid email format. Please check your email address."
        );
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
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Log in and start playing</Text>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password Input */}
          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Forgot Password Link */}
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.forgotPassText}>Forgot password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("PassReset")}>
              <Text style={styles.forgotPassLink}>Click here</Text>
            </TouchableOpacity>
          </View>

          {/* Log In Button */}
          <TouchableOpacity style={styles.logInButton} onPress={handleLogin}>
            <Text style={styles.logInText}>Log in</Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.createAccButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.createAccText}>Create account</Text>
          </TouchableOpacity>

          {/* Terms/Privacy Notice */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { textAlign: "center" }]}>
              By signing in with an account, you agree to NightOut's{" "}
              <Text style={styles.privTermsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.privTermsLink}>Privacy Policy</Text>
            </Text>
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
    fontWeight: "300",
    textAlign: "center",
    marginBottom: "25%",
  },
  input: {
    height: 55,
    backgroundColor: "#eef0f2",
    borderRadius: 13,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  forgotPassText: { color: "#666", fontSize: 14, textAlign: "left" },
  forgotPassLink: { color: "#FF007A", fontWeight: "bold", fontSize: 14 },
  logInButton: {
    backgroundColor: "#FF007A",
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
    marginTop: "50%",
  },
  logInText: { color: "white", fontWeight: "bold", fontSize: 16 },
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
  createAccButton: {
    backgroundColor: "#fbdbe9",
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  createAccText: { color: "black", fontWeight: "bold", fontSize: 16 },
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "3%",
  },
  footerText: { color: "#666", fontSize: 14 },
  privTermsLink: { color: "#FF007A", fontWeight: "bold", fontSize: 14 },
});

export default LoginScreen;
