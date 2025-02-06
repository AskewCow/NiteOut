import React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { SvgXml } from "react-native-svg";

import SignUpScreen from "./src/screens/SignUpScreen";
import PublicanSignUpScreen from "./src/screens/PublicanSignUpScreen";
import MainScreen from "./src/screens/MainScreen";
import LoginScreen from "./src/screens/LoginScreen";
import PassResetScreen from "./src/screens/PassResetScreen";
import ResetVerificationScreen from "./src/screens/ResetVerificationScreen";

import { logoXml } from "./src/utils/logo";

const navigator = createStackNavigator(
    {
        SignUp: SignUpScreen,
        PublicanSignUp: PublicanSignUpScreen,
        Main: MainScreen,
        Login: LoginScreen,
        PassReset: PassResetScreen,
        ResetVerification: ResetVerificationScreen,
    },
    {
        initialRouteName: "Login",
        defaultNavigationOptions: {
            headerTitle: () => <SvgXml xml={logoXml} width={40} height={40} />,
            headerStyle: {
                elevation: 0,
                shadowOpacity: 0,
                backgroundColor: "#00B4D8",
            },
            headerLeft: () => null, // Removes Back Button Globally
        },
    }
);

export default createAppContainer(navigator);
