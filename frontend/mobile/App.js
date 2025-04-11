import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Dimensions, TouchableOpacity } from "react-native";
import { SvgXml } from "react-native-svg";

import { GamerProvider } from "./src/contexts/GamerContext";
import { LocationProvider } from "./src/contexts/LocationContext";
// Screen imports
import BannedPlayers from "./src/screens/BannedPlayers";
import BannedPlayersScreen from "./src/screens/BannedPlayersScreen";
import ChosenEvent from "./src/screens/ChosenEvent";
import CreateEvent from "./src/screens/CreateEventScreen";
import FriendProfile from "./src/screens/FriendProfile";
import GameDetails from "./src/screens/GameDetails";
import HostGame from "./src/screens/HostGame";
import JoinGame from "./src/screens/JoinGame";
import LoginScreen from "./src/screens/LoginScreen";
import MainScreen from "./src/screens/MainScreen";
import MapScreen from "./src/screens/MapScreen";
import MyFriendsScreen from "./src/screens/MyFriendsScreen";
import PassResetScreen from "./src/screens/PassResetScreen";
import PfpChoiceScreen from "./src/screens/PfpChoiceScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import PublicanDetails from "./src/screens/PublicanDetails";
import PublicanLogin from "./src/screens/PublicanLogin";
import PublicanMainScreen from "./src/screens/PublicanMainScreen";
import PublicanSignUpScreen from "./src/screens/PublicanSignUpScreen";
import ReservedEvents from "./src/screens/ReservedEvents";
import ResetVerificationScreen from "./src/screens/ResetVerificationScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import { logoXml } from "./src/utils/logo";

const screenHeight = Dimensions.get("window").height;
const headerHeight = screenHeight * 0.12;

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
console.error = () => {};

function DrawerNavigator() {
  const [isPublican, setIsPublican] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User logged in:", user.uid);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          console.log("User data:", userSnap.data());
          const userData = userSnap.data();
          const isUserPublican =
            userData.publicanId !== undefined && userData.publicanId !== null;
          setIsPublican(isUserPublican);
          console.log("Is Publican:", isUserPublican);
        } else {
          console.log("User document not found.");
          setIsPublican(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

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
      {isPublican !== null && (
        <Drawer.Screen
          name="Main"
          component={isPublican ? PublicanMainScreen : MainScreen}
        />
      )}
      <Drawer.Screen
        name="My Profile"
        component={ProfileScreen}
        initialParams={{ gamerId: null }}
      />
      {!isPublican && (
        <Drawer.Screen name="My Games" component={ReservedEvents} />
      )}
      {!isPublican && (
        <Drawer.Screen
          name="My Friends"
          component={MyFriendsScreen}
          initialParams={{ gamerId: null }}
        />
      )}

      {!isPublican && <Drawer.Screen name="Host Game" component={HostGame} />}
      {isPublican && (
        <Drawer.Screen
          name="Banned Players"
          component={BannedPlayers}
          initialParams={{ gamerId: null }}
        />
      )}
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <GamerProvider>
      <LocationProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="LoginScreen"
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
                headerLeft: () => null,
              }}
            />
            <Stack.Screen
              name="PublicanSignUp"
              component={PublicanSignUpScreen}
              options={{
                headerShown: true,
                gestureEnabled: false,
                headerLeft: () => null,
              }}
            />
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{
                headerShown: true,
                gestureEnabled: false,
                headerLeft: () => null,
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
            <Stack.Screen
              name="PfpChoice"
              component={PfpChoiceScreen}
              options={{
                headerShown: false,
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
              options={({ navigation }) => ({
                headerShown: true,
                gestureEnabled: false,
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ paddingLeft: 20 }}
                  >
                    <Ionicons name="arrow-back" size={30} color="#FF007A" />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="ChosenEvent"
              component={ChosenEvent}
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="PublicanMainScreen"
              component={PublicanMainScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="CreateEvent"
              component={CreateEvent}
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="BannedPlayers"
              component={BannedPlayers}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="BannedPlayersScreen"
              component={BannedPlayersScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="JoinGame"
              component={JoinGame}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="PublicanLogin"
              component={PublicanLogin}
              options={{
                headerShown: true,
                gestureEnabled: false,
                headerLeft: () => null,
              }}
            />
            <Stack.Screen
              name="PublicanDetails"
              component={PublicanDetails}
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </LocationProvider>
    </GamerProvider>
  );
}
