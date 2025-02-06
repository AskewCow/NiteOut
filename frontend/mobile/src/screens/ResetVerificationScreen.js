import React, { useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    Keyboard,
} from "react-native";

const ResetVerificationScreen = ({ navigation }) => {
    const length = 5; // OTP Length
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputs = useRef([]);

    const handleChange = (text, index) => {
        if (/^\d$/.test(text)) {
            const newOtp = [...otp];
            newOtp[index] = text;
            setOtp(newOtp);

            // Move focus to next input
            if (index < length - 1) {
                inputs.current[index + 1].focus();
            }
        } else if (text === "") {
            // Allow backspace to clear the current box
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
        }
    };

    const handleKeyPress = (event, index) => {
        if (event.nativeEvent.key === "Backspace" && otp[index] === "") {
            if (index > 0) {
                inputs.current[index - 1].focus();
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
                    <Text style={styles.title}>Code sent!</Text>
                    <Text style={styles.subtitle}>Check your inbox</Text>

                    <View style={styles.footerText}>
                        <Text style={styles.forgotPassLink}>
                            Please enter it below:
                        </Text>
                    </View>

                    {/* OTP Input */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputs.current[index] = ref)}
                                style={styles.otpInput}
                                keyboardType="numeric"
                                maxLength={1}
                                value={digit}
                                onChangeText={(text) =>
                                    handleChange(text, index)
                                }
                                onKeyPress={(event) =>
                                    handleKeyPress(event, index)
                                }
                            />
                        ))}
                    </View>

                    {/* Password Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                    />

                    {/* Confirm Password Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#999"
                        secureTextEntry
                    />

                    {/* Send Code Button */}
                    <TouchableOpacity
                        style={styles.sendCodeButton}
                        onPress={() => navigation.navigate("ResetVerification")}
                    >
                        <Text style={styles.sendCodeText}>Reset Password</Text>
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
        marginBottom: 60,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    otpInput: {
        width: 50,
        height: 50,
        margin: 10,
        textAlign: "center",
        fontSize: 20,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#eef0f2",
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
        marginTop: "20%",
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

export default ResetVerificationScreen;
