import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { DrawerActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars"; // Import Calendar Component

// Contexts
import { useGamer } from "../contexts/GamerContext";

import LoadingAnimation from "../components/LoadingAnimation";
import { logoXml } from "../utils/logo";
import { SvgXml } from "react-native-svg";

// Firebase Import
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

const PublicanMainScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [games, setGames] = useState([]);
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [pubs, setPubs] = useState(null);
  const [fetchingPubs, setFetchingPubs] = useState(false);
  const [friends, setFriends] = useState(null);
  const { setGamerId } = useGamer();
  const [publicanId, setPublicanId] = useState(null);
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const searchBarRef = useRef(null);
  const [eventsByDate, setEventsByDate] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const mapRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  ); // Add State for Selected Date
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    fetchPubs();
    fetchUserInfo();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (publicanId) {
      console.log("Publican ID set, fetching events...");
      fetchEvents();
    }
  }, [publicanId]);

  useEffect(() => {
    if (games) {
      handleSearch();
    }
  }, [searchQuery, pubs, games]);

  useEffect(() => {
    console.log("Loading state before: ", loading);
    if (currentLocation && pubs && userInfo) {
      setLoading(false);
      setMapRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.0421,
      });
      console.log("Loading state after: ", loading);
    }
  }, [currentLocation, pubs, userInfo]);

  useEffect(() => {
    const checkPublican = async () => {
      try {
        const loggedInAs = await AsyncStorage.getItem("loggedInAs");
        const retrievedPublicanId = await AsyncStorage.getItem("publicanId");

        console.log("Logged in as:", loggedInAs);
        console.log(
          "Retrieved Publican ID from AsyncStorage:",
          retrievedPublicanId
        );

        if (loggedInAs !== "publican" || !retrievedPublicanId) {
          console.warn("Publican validation failed, redirecting to login.");
          navigation.navigate("LoginScreen");
          return;
        }

        setPublicanId(retrievedPublicanId);
      } catch (error) {
        console.error("Error checking publican: ", error);
      } finally {
        setLoading(false);
      }
    };

    checkPublican();
  }, []);

  const handleDateSelect = (date) => {
    const newSelectedDate = date.dateString;
    const updatedMarkedDates = Object.keys(markedDates).reduce((acc, key) => {
      acc[key] = { ...markedDates[key], selected: false };
      return acc;
    }, {});

    updatedMarkedDates[newSelectedDate] = {
      ...updatedMarkedDates[newSelectedDate],
      selected: true,
      selectedColor: "#00B4D8",
    };

    setSelectedDate(newSelectedDate);
    setMarkedDates(updatedMarkedDates);
  };

  // Fetch pub data from Firestore
  const fetchPubs = async () => {
    setFetchingPubs(true);
    try {
      const pubsCollect = await getDocs(collection(db, "publicans"));
      const pubList = pubsCollect.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          pub_name: data.pub_name,
          address: data.address,
          xcoord: data.xcoord,
          ycoord: data.ycoord,
          BER: data.BER || "",
          BER_url: data.BER_url || "",
        };
      });

      if (pubList.length === 0) {
        console.warn("No pubs in list.");
      }

      console.log("Fetched pubs: ", pubList);
      setPubs(pubList);
    } catch (error) {
      console.log("Error fetching pubs: ", error);
    } finally {
      setFetchingPubs(false);
    }
  };

  // Fetch games info from Firestore

  // Fetch events created by the logged-in publican from Firestore
  const fetchEvents = async () => {
    try {
      if (!publicanId) {
        console.log("Publican ID not set, unable to fetch events.");
        return;
      }

      const eventsRef = collection(db, "events");
      const q = query(eventsRef, where("pub_id", "==", publicanId));
      const querySnapshot = await getDocs(q);
      const eventList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        event_name: doc.data().event_name,
        location: doc.data().location,
        start_time: doc.data().start_time,
        end_time: doc.data().end_time,
        expires: doc.data().expires,
        num_seats: doc.data().num_seats,
      }));

      console.log("Fetched events: ", eventList);
      setEvents(eventList);

      const newEvents = {};
      const newMarkedDates = {};

      eventList.forEach((event) => {
        const eventStart = moment(event.start_time).format("YYYY-MM-DD");
        const eventExpire = moment(event.expires).format("YYYY-MM-DD");

        for (
          let date = moment(eventStart);
          date.isSameOrBefore(moment(eventExpire));
          date.add(1, "day")
        ) {
          const formattedDate = date.format("YYYY-MM-DD");
          if (!newEvents[formattedDate]) newEvents[formattedDate] = [];
          newEvents[formattedDate].push(event);

          newMarkedDates[formattedDate] = {
            marked: true,
            dotColor: "#FF006E",
            selectedColor:
              selectedDate === formattedDate ? "#90E0EF" : undefined,
          };
        }
      });

      setEventsByDate(newEvents);
      setMarkedDates(newMarkedDates);
    } catch (error) {
      console.error("Error fetching Events: ", error);
    }
  };

  // Filter events by date
  const filterEventsByDate = (date, events) => {
    const filtered = events.filter(
      (event) =>
        moment(date).isSameOrAfter(moment(event.start_time), "day") &&
        moment(date).isSameOrBefore(moment(event.expires), "day")
    );
    setFilteredEvents(filtered);
  };

  // Fetch User Info from Firestore
  // Fetch User Info from Firestore
  const fetchUserInfo = async () => {
    setFetchingUser(true);
    try {
      const loggedInAs = await AsyncStorage.getItem("loggedInAs");
      let publicanId = await AsyncStorage.getItem("publicanId");

      console.log("Logged in as:", loggedInAs);
      console.log("Retrieved Publican ID from AsyncStorage:", publicanId);

      if (loggedInAs === "publican" && publicanId) {
        setPublicanId(publicanId);

        // Double-check if publicanId is correctly retrieved
        if (!publicanId) {
          console.warn("Publican ID is not available.");
          navigation.navigate("LoginScreen");
          return;
        }

        const userDoc = await getDoc(doc(db, "publicans", publicanId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Publican Data Retrieved:", userData);

          setUserInfo({
            fullName: userData.pub_name || "Unknown",
            publican_id: publicanId,
          });
          setLoading(false);
        } else {
          console.log("No publican document found with ID:", publicanId);
          navigation.navigate("LoginScreen");
        }
      } else {
        navigation.navigate("LoginScreen");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.code === "unavailable") {
        alert("Network error. Please check your connection.");
      }
    } finally {
      setFetchingUser(false);
    }
  };
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    const filteredPubs = (pubs || [])
      .filter((pub) =>
        pub.pub_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((pub) => ({ ...pub, type: "pub" }));

    const filteredGames = (games || [])
      .filter((game) =>
        game.game_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((game) => ({ ...game, type: "game" }));

    setFilteredResults([...filteredPubs, ...filteredGames]);
  };

  const handleResultPress = (item) => {
    if (item.type === "pub" && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: item.xcoord,
          longitude: item.ycoord,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        3000
      );
    } else if (item.type === "game") {
      alert(`Game: ${item.game_name}`);
    }
    setSearchQuery("");
    setFilteredResults([]);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingAnimation />
      </View>
    );
  }

  const handleProfilePress = (gamerId) => {
    console.log("GamerId: ", gamerId);
    if (gamerId) {
      navigation.dispatch(DrawerActions.openDrawer());
    } else {
      alert("Please log in again.");
      navigation.navigate("Login");
      return;
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (isSearchActive) {
          setIsSearchActive(false);
          setSearchQuery("");
          setFilteredResults([]);
        }
        Keyboard.dismiss();
      }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.userIconContainer}>
                <TouchableOpacity
                  onPress={() => handleProfilePress(userInfo?.publican_id)}
                >
                  <SvgXml xml={logoXml} width={40} height={40} />
                </TouchableOpacity>

                <Text style={{ fontSize: 24, color: "black" }}>
                  {userInfo?.fullName || ""}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.tagContainer}>
            <View style={styles.createEventContainer}>
              <TouchableOpacity
                style={styles.createEventButton}
                onPress={() => navigation.navigate("CreateEvent")}
              >
                <Ionicons name="add" size={30} color="white" />
                <Text style={styles.createEventText}>Create Event</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.createEventContainer}>
              <TouchableOpacity
                style={styles.createEventButton}
                onPress={() => navigation.navigate("BannedPlayersScreen")}
              >
                <Ionicons name="ban" size={30} color="white" />
                <Text style={styles.createEventText}>Ban Player</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarContainer}>
            <Calendar
              current={moment().format("YYYY-MM-DD")}
              markedDates={markedDates}
              onDayPress={handleDateSelect}
              style={styles.calendar}
              theme={{
                todayTextColor: "#00B4D8",
              }}
              renderArrow={(direction) => (
                <Text style={{ fontSize: 20, color: "black" }}>
                  {direction === "left" ? "←" : "→"}
                </Text>
              )}
            />
          </View>

          {/* Event List */}
          <ScrollView style={styles.scrollView}>
            {selectedDate && eventsByDate[selectedDate] ? (
              eventsByDate[selectedDate].map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventInfo}>
                      <Text style={styles.boldText}>Start Time:</Text>{" "}
                      {moment(event.start_time).format("hh:mm A")}
                    </Text>
                    <Text style={styles.eventInfo}>
                      <Text style={styles.boldText}>End Time:</Text>{" "}
                      {moment(event.end_time).format("hh:mm A")}
                    </Text>
                    <Text style={styles.eventInfo}>
                      <Text style={styles.boldText}>Seats Available:</Text>{" "}
                      {event.num_seats}
                    </Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.moreDetailsButton}
                      // onPress={() =>
                      //   navigation.navigate("EventDetails", { event })
                      // }
                    >
                      <Text
                        style={styles.moreDetailsButtonText}
                        onPress={() =>
                          navigation.navigate("PublicanDetails", {
                            eventId: event.id,
                          })
                        }
                      >
                        More Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noEventsText}>
                {selectedDate
                  ? "No events on this day."
                  : "Select a date to view events."}
              </Text>
            )}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#00B4D8",
    justifyContent: "flex-start",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  userIconContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
    borderRadius: 20,
  },
  calendarContainer: {
    marginVertical: 20,
    width: "95%",
    alignSelf: "center",
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: "#eef0f2",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginLeft: 5,
    fontSize: 17,
  },
  searchResultsContainer: {
    position: "absolute",
    top: 60,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    maxHeight: 200,
    zIndex: 10,
  },
  scrollView: {
    maxHeight: 200,
  },
  searchResult: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  resultText: {
    fontSize: 16,
  },
  tagContainer: {
    flex: 1,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    marginBottom: 7,
  },
  tagButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedTag: {
    backgroundColor: "#FF006E",
  },
  unselectedTag: {
    backgroundColor: "#FFDCEC",
  },
  tagText: {
    fontSize: 16,
    lineHeight: 16 * 1.2,
    color: "black",
  },
  map: {
    width: "95%",
    height: "71%",
    borderRadius: 10,
    paddingBottom: 0,
  },
  closeButton: {
    marginTop: 20,
    fontSize: 16,
    color: "#00B4D8",
    fontWeight: "bold",
  },
  friendsContainer: {
    width: "45%",
    height: "45%",
    backgroundColor: "#90E0EF",
    borderRadius: 10,
    padding: 10,
    marginTop: 100,
    marginLeft: 10,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  friendItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  friendName: {
    fontSize: 16,
  },
  noFriendsText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  calendar: {
    marginTop: 0,
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "95%",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#90E0EF",
    width: "95%",
    alignSelf: "center",
    borderRadius: 10,
    padding: 20,
  },

  eventItem: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: "row",
  },

  eventName: {
    fontSize: 16,
  },

  eventLocation: {
    fontSize: 14,
    color: "#555",
  },

  eventTime: {
    fontSize: 14,
    color: "#555",
    alignSelf: "center",
  },

  eventDetails: {
    flexDirection: "column",
    flex: 1,
    padding: 10,
  },

  noEventsText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    color: "#555",
  },
  eventsContainer: {
    width: "95%",
    alignSelf: "center",
    marginTop: 20,
  },
  eventInfo: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
  },
  boldText: {
    fontWeight: "bold",
  },
  moreDetailsButton: {
    backgroundColor: "#FF007A",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignSelf: "center",
  },
  moreDetailsButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
  },
  createEventContainer: {
    flex: 1,
    width: "95%",
    alignSelf: "center",
    marginBottom: 10,
  },
  createEventButton: {
    backgroundColor: "#FF006E",
    borderRadius: 15,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",
  },
  createEventText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default PublicanMainScreen;
