import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { SvgXml } from "react-native-svg";
import { Dimensions, TouchableOpacity } from "react-native";
import { GamerProvider } from "./src/contexts/GamerContext";
import { LocationProvider } from "./src/contexts/LocationContext";
import { logoXml } from "./src/utils/logo";
import { Ionicons } from "@expo/vector-icons";

// Screen imports
import SignUpScreen from "./src/screens/SignUpScreen";
import PublicanSignUpScreen from "./src/screens/PublicanSignUpScreen";
import LoginScreen from "./src/screens/LoginScreen";
import PassResetScreen from "./src/screens/PassResetScreen";
import ResetVerificationScreen from "./src/screens/ResetVerificationScreen";
import MapScreen from "./src/screens/MapScreen";
import MainScreen from "./src/screens/MainScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import pfpChoiceScreen from "./src/screens/pfpChoiceScreen";
import GameDetails from "./src/screens/GameDetails";
import FriendProfile from "./src/screens/FriendProfile";
import ReservedEvents from "./src/screens/ReservedEvents";
import MyFriends from "./src/screens/MyFriendsScreen";
import MyFriendsScreen from "./src/screens/MyFriendsScreen";

const screenHeight = Dimensions.get("window").height;
const headerHeight = screenHeight * 0.12;

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
console.error = () => {};

function DrawerNavigator() {
    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: "#FFDCEC",
                    width: 250,
                },
                drawerActiveTintColor: "#FFFFFF",
                drawerInactiveTintColor: "#FF006E",
                drawerActiveBackgroundColor: "#FF006E",
            }}
        >
            <Drawer.Screen name="Main" component={MainScreen} />
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                initialParams={{ gamerId: null }}
                options={({ navigation }) => ({
                    headerTitle: "",
                    headerTitleAlign: "center",
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.openDrawer()}
                        >
                            <SvgXml
                                xml={logoXml}
                                width={40}
                                height={40}
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ),
                    headerStyle: {
                        elevation: 0,
                        shadowOpacity: 0,
                        height: headerHeight,
                        backgroundColor: "#00B4D8",
                    },
                    headerTitleContainerStyle: {
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                    },
                })}
            />
            <Drawer.Screen name="My Games" component={ReservedEvents} />
            <Drawer.Screen
                name="My Friends"
                component={MyFriendsScreen}
                initialParams={{ gamerId: null }}
                options={({ navigation }) => ({
                    headerTitle: "",
                    headerTitleAlign: "center",
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.openDrawer()}
                        >
                            <SvgXml
                                xml={logoXml}
                                width={40}
                                height={40}
                                style={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ),
                    headerStyle: {
                        elevation: 0,
                        shadowOpacity: 0,
                        height: headerHeight,
                        backgroundColor: "#00B4D8",
                    },
                    headerTitleContainerStyle: {
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                    },
                })}
            />
        </Drawer.Navigator>
    );
}

export default function App() {
    return (
        <GamerProvider>
            <LocationProvider>
                <NavigationContainer>
                    <Stack.Navigator
                        initialRouteName="Login"
                        screenOptions={({ navigation, route }) => ({
                            headerTitle: () => (
                                <SvgXml xml={logoXml} width={40} height={40} />
                            ),
                            headerTitleAlign: "center",
                            headerStyle: {
                                elevation: 0,
                                shadowOpacity: 0,
                                height: headerHeight,
                                backgroundColor: "#00B4D8",
                            },
                            headerTitleContainerStyle: {
                                justifyContent: "center",
                                alignItems: "center",
                                flex: 1,
                            },
                            gestureEnabled: false, // Disable swipe back globally
                        })}
                    >
                        <Stack.Screen
                            name="Drawer"
                            component={DrawerNavigator}
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
                            options={{
                                headerShown: true,
                                gestureEnabled: false,
                            }}
                        />
                        <Stack.Screen
                            name="PublicanSignUp"
                            component={PublicanSignUpScreen}
                            options={{
                                headerShown: true,
                                gestureEnabled: false,
                            }}
                        />
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{
                                headerShown: true,
                                gestureEnabled: false,
                            }}
                        />
                        <Stack.Screen
                            name="PassReset"
                            component={PassResetScreen}
                            options={{
                                headerShown: true,
                                gestureEnabled: false,
                            }}
                        />
                        <Stack.Screen
                            name="ResetVerification"
                            component={ResetVerificationScreen}
                            options={{
                                headerShown: true,
                                gestureEnabled: false,
                            }}
                        />
                        {/* <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            headerShown: false,
                            gestureEnabled: false, // Prevent swiping back from Profile
                        }}
                    /> */}
                        <Stack.Screen
                            name="Profile"
                            component={ProfileScreen}
                            initialParams={{ gamerId: null }}
                            options={({ navigation }) => ({
                                headerTitle: () => (
                                    <SvgXml
                                        xml={logoXml}
                                        width={40}
                                        height={40}
                                    />
                                ),
                                headerTitleAlign: "center",
                                headerShown: true,
                                headerLeft: () => (
                                    <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                    >
                                        <Ionicons
                                            name="arrow-back"
                                            size={24}
                                            color="white"
                                            style={{ marginLeft: 10 }}
                                        />
                                    </TouchableOpacity>
                                ),
                                headerStyle: {
                                    elevation: 0,
                                    shadowOpacity: 0,
                                    height: headerHeight,
                                    backgroundColor: "#00B4D8",
                                },
                                headerTitleContainerStyle: {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flex: 1,
                                },
                            })}
                        />
                        <Stack.Screen
                            name="pfpChoice"
                            component={pfpChoiceScreen}
                            options={{
                                headerShown: true,
                                gestureEnabled: false,
                            }}
                        />
                        <Stack.Screen
                            name="GameDetails"
                            component={GameDetails}
                            options={{
                                headerShown: false,
                                gestureEnabled: false,
                            }}
                        />
                        <Stack.Screen
                            name="FriendProfile"
                            component={FriendProfile}
                            options={{
                                headerShown: true,
                                gestureEnabled: false,
                            }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </LocationProvider>
        </GamerProvider>
    );
}
