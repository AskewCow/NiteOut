import * as ImagePicker from "expo-image-picker";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Keyboard,
  ScrollView,
  Alert,
} from "react-native";
import { SvgXml } from "react-native-svg";

import BerDescription from "../components/BerDescription";
import BerPicker, { getColorForRating } from "../components/BerPicker";
import { auth, db } from "../firebaseConfig";
import { checkmarkXml } from "../utils/checkmark";
import { infoIconXml } from "../utils/infoIcon";
import { uploadXml } from "../utils/upload";

const PublicanSignUpScreen = ({ navigation }) => {
  const [pub_name, setPubName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setPubAddress] = useState("");
  const [pubEircode, setPubEircode] = useState("");
  const [password, setPassword] = useState("");
  const [pubThumbnail, setPubThumbnail] = useState(null);
  const [berCertificate, setBerCertificate] = useState(null);
  const [selectedBerRating, setSelectedBerRating] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const [pubNameError, setPubNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [pubAddressError, setPubAddressError] = useState("");
  const [pubEircodeError, setPubEircodeError] = useState("");
  const [, setBerRatingError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleImagePicker = async (setImageState) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaType: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageState(result.assets[0]);
    }
  };

  const checkPubExists = async (pubName) => {
    const pubsRef = collection(db, "publicans");
    const q = query(pubsRef, where("pubName", "==", pubName));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if pub already exists
  };

  const fetchCoordinates = async (eircode) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        eircode
      )}&key=REDACTED`;

      console.log("Fetching from URL:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status); // Check if the status is 200
      const data = await response.json();

      if (data.status === "OK") {
        console.log("Geolocation API Response:", JSON.stringify(data, null, 2));

        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          console.log(`Latitude: ${lat}, Longitude: ${lng}`);
          return { xcoord: lat, ycoord: lng };
        } else {
          throw new Error("Invalid Eircode. No coordinates found.");
        }
      } else {
        console.error(
          `Geocoding API error: ${data.status} - ${
            data.error_message || "No error message provided"
          }`
        );
        throw new Error("Failed to fetch coordinates.");
      }
    } catch (error) {
      console.error("❌ Error fetching coordinates:", error);
      return null;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEircode = (eircode) => {
    const eircodeRegex = /^([A-Z0-9]{3}[ ]?[A-Z0-9]{4})$/i; // Matches Eircode format
    return eircodeRegex.test(eircode);
  };

  const validateAddress = (address) => {
    return address.trim().length >= 5; // Ensures address is at least 5 characters long
  };

  const handlePublicanSignUp = async () => {
    console.log("SignUp Clicked");

    try {
      // Reset any existing error states
      setPubNameError("");
      setPhoneNumberError("");
      setPubAddressError("");
      setPubEircodeError("");
      setBerRatingError("");
      setEmailError("");
      setPasswordError("");

      // Validate Input Fields
      if (
        !pub_name ||
        !phoneNumber ||
        !address ||
        !pubEircode ||
        !selectedBerRating
      ) {
        console.log("Missing required fields");
        Alert.alert(
          "Missing Information",
          "Please fill in all fields before signing up."
        );
        return;
      }
      console.log("Required fields validation passed");

      if (!validateEmail(email)) {
        setEmailError("Please enter a valid email address*");
        return;
      }
      console.log("Email validation passed");

      if (!validateAddress(address)) {
        setPubAddressError("Please enter a valid address*");
        return;
      }

      if (!validateEircode(pubEircode)) {
        setPubEircodeError("Please enter a valid Eircode (e.g. R21 XXXX).");
        return;
      }
      console.log("Eircode validation passed");

      if (!password) {
        console.log("Password missing*");
        setPasswordError("Password is required.");
        return;
      }
      console.log("Password validation passed");

      // Check if pub already exists
      console.log("Checking if pub exists with name:", pub_name);
      const pubExists = await checkPubExists(pub_name);
      console.log("Pub exists check result:", pubExists);

      if (pubExists) {
        console.log("Pub already exists");
        Alert.alert(
          "Duplicate Pub",
          "A pub with this name already exists. Choose another name."
        );
        return;
      }
      console.log("Pub name is unique");

      // Create Firebase Auth user
      console.log("Creating Firebase user with email:", email);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Firebase user created with ID:", user.uid);

      // Update profile
      console.log("Updating user profile with displayName:", pub_name);
      await updateProfile(user, { displayName: pub_name });
      console.log("User profile updated");

      // Get coordinates
      console.log("Fetching coordinates for eircode:", pubEircode);
      const coords = await fetchCoordinates(pubEircode);
      console.log("Coordinates result:", coords);

      if (!coords) {
        console.log("Failed to get coordinates");
        Alert.alert(
          "Invalid Eircode",
          "Could not fetch coordinates. Please check your Eircode."
        );
        return;
      }
      console.log("Coordinates fetched successfully");

      // Prepare pub data
      console.log("Preparing pub data");
      const pubData = {
        pub_name,
        phoneNumber,
        address,
        pubEircode,
        BER: selectedBerRating,
        xcoord: coords.xcoord,
        ycoord: coords.ycoord,
        email,
        password,
        pub_image_url: pubThumbnail ? pubThumbnail.uri : null,
        BER_url: berCertificate ? berCertificate.uri : null,
        events: [],
        uid: user.uid,
      };
      console.log("Pub data prepared:", JSON.stringify(pubData));

      // Save to Firestore
      console.log(
        "Saving to Firestore in 'publicans' collection with ID:",
        user.uid
      );
      await setDoc(doc(db, "publicans", user.uid), pubData);
      console.log("✅ Publican details saved to Firestore");

      Alert.alert("Success", "Your pub has been registered!");
      navigation.navigate("Drawer", { screen: "Home" });
    } catch (error) {
      console.error("❌ Error type:", typeof error);
      console.error(
        "❌ Error signing up publican:",
        error.message || "No error message"
      );
      console.error("❌ Error code:", error.code || "No error code");
      console.error("❌ Stack trace:", error.stack || "No stack trace");

      // Handle errors appropriately
      if (error.code === "auth/email-already-in-use") {
        setEmailError("Email is already in use. Please try another one.");
      } else if (error.code === "auth/weak-password") {
        setPasswordError("Password is too weak! Try a stronger one.");
      } else if (error.code === "auth/invalid-email") {
        setEmailError("Invalid email format.");
      } else {
        Alert.alert(
          "Error",
          `Something went wrong. Error: ${error.message || "Unknown error"}`
        );
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={[styles.section, styles.backgroundBlue]} />
        <View style={[styles.section, styles.backgroundLightBlue]} />
        <View style={[styles.section, styles.backgroundWhite]} />
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>List your pub, start now!</Text>
        </View>
        {/* Scrollable Form Container */}
        <ScrollView
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Pub Name Error */}
          <View style={{ minHeight: 17 }}>
            {pubNameError ? (
              <Text style={styles.errorText}>{pubNameError}</Text>
            ) : null}
          </View>

          {/* Pub Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Pub Name"
            placeholderTextColor="#999"
            value={pub_name}
            onChangeText={setPubName}
          />

          {/* Phone Number Error */}
          <View style={{ minHeight: 17 }}>
            {phoneNumberError ? (
              <Text style={styles.errorText}>{phoneNumberError}</Text>
            ) : null}
          </View>

          {/* Phone Number Input */}
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
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
            onChangeText={setEmail}
          />

          {/* Pub Address Error */}
          <View style={{ minHeight: 17 }}>
            {pubAddressError ? (
              <Text style={styles.errorText}>{pubAddressError}</Text>
            ) : null}
          </View>

          {/* Pub Address Input */}
          <TextInput
            style={styles.input}
            placeholder="Pub Address"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setPubAddress}
          />

          {/* Pub Eircode Error */}
          <View style={{ minHeight: 17 }}>
            {pubEircodeError ? (
              <Text style={styles.errorText}>{pubEircodeError}</Text>
            ) : null}
          </View>

          {/* Pub Eircode Input */}
          <TextInput
            style={styles.input}
            placeholder="Pub Eircode"
            placeholderTextColor="#999"
            value={pubEircode}
            onChangeText={setPubEircode}
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

          {/* BER Rating Input */}
          <View>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                {
                  backgroundColor: "#eef0f2",
                  position: "relative",
                  marginTop: 20,
                },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={[
                  styles.uploadButtonText,
                  {
                    color: selectedBerRating
                      ? getColorForRating(selectedBerRating)
                      : "#999",
                    fontWeight: selectedBerRating ? "bold" : "normal",
                  },
                ]}
              >
                {selectedBerRating || "Select BER Rating"}
              </Text>

              {/* Info Icon for BER inside the button with its own TouchableOpacity */}
              <TouchableOpacity
                onPress={() => setInfoModalVisible(true)} // Handle the icon press
                style={{
                  position: "absolute",
                  right: "5%",
                }}
              >
                <SvgXml xml={infoIconXml} width={25} height={25} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* BER Upload Certificate */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleImagePicker(setBerCertificate)}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <SvgXml
                xml={berCertificate ? checkmarkXml : uploadXml}
                width={30}
                height={30}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.uploadButtonText]}>
                {berCertificate
                  ? "Uploaded BER Certificate"
                  : "Upload BER Certificate"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Pub Thumbnail Upload */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleImagePicker(setPubThumbnail)}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <SvgXml
                xml={pubThumbnail ? checkmarkXml : uploadXml}
                width={30}
                height={30}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.uploadButtonText]}>
                {pubThumbnail
                  ? "Uploaded Pub Thumbnail"
                  : "Upload Pub Thumbnail"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign Up as Publican Button */}
          <TouchableOpacity
            style={styles.publicanButton}
            onPress={handlePublicanSignUp}
          >
            <Text style={styles.publicanText}>Sign up as Publican</Text>
          </TouchableOpacity>

          {/* Footer Container */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen")}
            >
              <Text style={styles.signInLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* BER Picker Modal */}
        <BerPicker
          visible={modalVisible}
          selectedValue={selectedBerRating}
          onValueChange={(itemValue) => setSelectedBerRating(itemValue)}
          onClose={() => setModalVisible(false)}
        />

        {/* BER Description Modal */}
        <BerDescription
          visible={infoModalVisible}
          onClose={() => setInfoModalVisible(false)}
        />
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
    fontWeight: "light",
    textAlign: "center",
    marginBottom: "10%",
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
  uploadButton: {
    height: 55,
    backgroundColor: "#FBDBE9",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 13,
    justifyContent: "center",
    marginBottom: 35,
  },
  uploadButtonText: {
    color: "#FF006E",
    fontWeight: "bold",
  },
  uploadedText: {
    color: "#4CAF50",
    textAlign: "center",
    marginTop: 5,
  },
  publicanButton: {
    backgroundColor: "#FF007A",
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
    marginTop: "7%",
  },
  publicanText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
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

export default PublicanSignUpScreen;
