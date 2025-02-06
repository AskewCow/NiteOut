import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    Keyboard,
} from "react-native";

const PublicanSignUpScreen = ({ navigation }) => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <View style={[styles.section, styles.backgroundBlue]} />
                <View style={[styles.section, styles.backgroundLightBlue]} />
                <View style={[styles.section, styles.backgroundWhite]} />

                {/* Form Container */}
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Need a Reset?</Text>
                    <Text style={styles.subtitle}>Let's fix that</Text>

                    {/* Email Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                    />

                    {/* Sign Up as Publican Button */}
                    <TouchableOpacity
                        style={styles.sendCodeButton}
                        onPress={() => navigation.navigate("ResetVerification")}
                    >
                        <Text style={styles.sendCodeText}>Send Code</Text>
                    </TouchableOpacity>

                    {/* Sign In Link */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>
                            Already have an account?{" "}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={styles.signInLink}>Sign in</Text>
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
        fontWeight: "light",
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
    sendCodeButton: {
        backgroundColor: "#FF007A",
        paddingVertical: 20,
        borderRadius: 15,
        alignItems: "center",
        marginTop: "100%",
    },
    sendCodeText: {
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
