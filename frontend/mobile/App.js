import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { SvgXml } from "react-native-svg";
import { Dimensions } from "react-native";

// Screen imports
import SignUpScreen from "./src/screens/SignUpScreen";
import PublicanSignUpScreen from "./src/screens/PublicanSignUpScreen";
import LoginScreen from "./src/screens/LoginScreen";
import PassResetScreen from "./src/screens/PassResetScreen";
import ResetVerificationScreen from "./src/screens/ResetVerificationScreen";
import MapScreen from "./src/screens/MapScreen";
import MainScreen from "./src/screens/MainScreen";
import PracticeHomeScreen from "./src/screens/PracticeHomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import pfpChoiceScreen from "./src/screens/pfpChoiceScreen";

import { logoXml } from "./src/utils/logo";

const screenHeight = Dimensions.get("window").height;
const headerHeight = screenHeight * 0.12;

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerTitle: () => (
                        <SvgXml xml={logoXml} width={40} height={40} />
                    ),
                    headerTitleAlign: "center",
                    headerStyle: {
                        elevation: 0,
                        shadowOpacity: 0,
                        height: headerHeight, // Adjust dynamically
                        backgroundColor: "#00B4D8",
                    },
                    headerTitleContainerStyle: {
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                    },
                    headerLeft: () => null,
                }}
            >
                <Stack.Screen
                    name="PracticeHome"
                    component={PracticeHomeScreen}
                />
                <Stack.Screen
                    name="Main"
                    component={MainScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Map"
                    component={MapScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="SignUp"
                    component={SignUpScreen}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name="PublicanSignUp"
                    component={PublicanSignUpScreen}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name="PassReset"
                    component={PassResetScreen}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name="ResetVerification"
                    component={ResetVerificationScreen}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name="pfpChoice"
                    component={pfpChoiceScreen}
                    options={{ headerShown: true }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
