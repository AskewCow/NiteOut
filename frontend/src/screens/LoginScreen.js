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

const SignUpScreen = ({ navigation }) => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <View style={[styles.section, styles.backgroundBlue]} />
                <View style={[styles.section, styles.backgroundLightBlue]} />
                <View style={[styles.section, styles.backgroundWhite]} />

                {/* Form Container */}
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Welcome back!</Text>
                    <Text style={styles.subtitle}>
                        Log in and start playing
                    </Text>

                    {/* Full Name Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                    />

                    {/* Password Input */}
                    <TextInput
                        style={[styles.input, { marginBottom: 10 }]} // Override marginBottom for password
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                    />

                    {/* Forgot Pass Link */}
                    <View style={{ flexDirection: "row" }}>
                        <Text style={styles.forgotPassText}>
                            Forgot password?{" "}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("PassReset")}
                        >
                            <Text style={styles.forgotPassLink}>
                                Click here
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Button */}
                    <TouchableOpacity style={styles.logInButton}>
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

                    {/* Terms/Privacy Button */}
                    <View style={styles.footerContainer}>
                        <Text
                            style={[styles.footerText, { textAlign: "center" }]}
                        >
                            By signing in with an account, you agree to
                            NightOut's{" "}
                            <Text style={styles.privTermsLink}>
                                Terms of Service
                            </Text>{" "}
                            and{" "}
                            <Text style={styles.privTermsLink}>Privacy</Text>
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
        marginBottom: "25%",
    },
    input: {
        height: 55,
        backgroundColor: "#eef0f2",
        borderRadius: 13,
        paddingHorizontal: 15,
        marginBottom: 25,
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
        marginVertical: "2%", // Adjust spacing as needed
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#FF007A", // Pink color
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
        alignItems: "center", // Centers content vertically
        justifyContent: "center", // Centers content horizontally
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

export default SignUpScreen;
