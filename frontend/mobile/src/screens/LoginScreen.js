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
import { useEffect } from "react";

// Firebase Imports
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

// AsyncStorage Import
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setEmailError(""); // Reset email error
      setPasswordError(""); // Reset password error
    });

    // Cleanup the listener when the component unmounts or on focus change
    return unsubscribe;
  }, [navigation]);

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email || !password) {
      if (!email) setEmailError("*Email is required.");
      if (!password) setPasswordError("*Password is required.");
      return;
    }

    try {
      const response = await fetch(
        "https://d1ff-185-134-146-110.ngrok-free.app/gamer_login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404)
          setEmailError("No user found with this email.");
        else if (response.status === 401)
          setPasswordError("Incorrect password.");
        else setEmailError(data.error || "Login failed");
        return;
      }

      // Save gamerId to AsyncStorage
      await AsyncStorage.setItem("gamerId", data.gamerId);
      console.log("Gamer ID stored successfully:", data.gamerId);

      navigation.navigate("Drawer", { screen: "Home" });
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login failed", "Unable to connect to the server.");
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

          {/* Email Error Message */}
          <View style={{ minHeight: 20 }}>
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
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(""); // Clear error on change
            }}
          />

          {/* Password Error Message (fixed height to prevent shifting) */}
          <View style={{ minHeight: 20 }}>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(""); // Clear error on change
            }}
          />

          {/* Forgot Pass Link */}
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
    fontWeight: "300",
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
    marginBottom: 5,
  },
  forgotPassText: {
    color: "#666",
    fontSize: 14,
    textAlign: "left",
  },
  forgotPassLink: {
    color: "#FF007A",
    fontWeight: "bold",
    fontSize: 14,
  },
  logInButton: {
    backgroundColor: "#FF007A",
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
    marginTop: "50%",
  },
  logInText: {
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
  createAccButton: {
    backgroundColor: "#fbdbe9",
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  createAccText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "3%",
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  privTermsLink: {
    color: "#FF007A",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default LoginScreen;
