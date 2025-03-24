import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { db } from "../firebaseConfig";
import { useGamer } from "../contexts/GamerContext";
import { getDoc, doc } from "firebase/firestore";
import { SvgXml } from "react-native-svg";
import { logoXml } from "../utils/logo";
import { DrawerActions, useFocusEffect } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";

const ReservedEvents = ({ navigation }) => {
  const { gamerId } = useGamer();
  const [eventsByDate, setEventsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  const fetchReservations = async () => {
    try {
      console.log("gamerId: ", gamerId);
      const userDoc = await getDoc(doc(db, "gamers", gamerId));

      const userData = userDoc.data();
      if (userData && (userData.hosted_games || userData.joined_games)) {
        const allGameIds = [
          ...(userData.hosted_games || []),
          ...(userData.joined_games || []),
        ];

        const gamePromises = allGameIds.map((gameId) =>
          getDoc(doc(db, "games", gameId)).catch((error) => {
            console.error("Error fetching game: ", error);
            return undefined;
          })
        );

        const gameDocs = await Promise.all(gamePromises);
        const newEvents = {};
        const newMarkedDates = {};
        console.log("games: ", gameDocs);

        gameDocs.forEach((doc) => {
          if (doc.exists()) {
            const gameData = doc.data();
            const gameId = doc.id;
            const { start_time, game_name, location } = gameData;
            const dateObj = new Date(start_time);
            const formattedDate = dateObj.toISOString().split("T")[0];
            const time = dateObj.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            console.log("game: ", gameData);
            if (!newEvents[formattedDate]) {
              newEvents[formattedDate] = [];
            }
            newEvents[formattedDate].push({
              id: gameId,
              ...gameData, // include all Firestore game fields
              time, // override or append any custom fields
            });

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
      }
    } catch (error) {
      console.error("Error fetching hosted games:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [gamerId])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          Upcoming reservations
        </Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={handleProfilePress}>
            <SvgXml xml={logoXml} width={40} height={40} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>My Games</Text>
      </View>
      {/* Calendar View */}
      <Calendar
        current={new Date().toISOString().split("T")[0]}
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

      {/* Event List */}
      <ScrollView style={styles.scrollView}>
        {selectedDate && eventsByDate[selectedDate] ? (
          eventsByDate[selectedDate].map((event, index) => (
            <TouchableOpacity
              key={index}
              style={styles.eventItem}
              onPress={() =>
                navigation.navigate("GameDetails", { game: event })
              }
            >
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.game_name}</Text>
                <Text style={styles.pubName}>{event.location}</Text>
              </View>
              <Text style={styles.eventTime}>{event.time}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEventsText}>
            {selectedDate
              ? "You have no games on this day."
              : "Select a date to view games."}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    paddingLeft: 10,
    flex: 1,
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
    padding: 10,
  },
  eventItem: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: "row",
  },
  eventTitle: {
    fontSize: 16,
  },
  eventTime: {
    fontSize: 14,
    color: "#555",
    alignSelf: "center",
  },
  eventDetails: {
    flexDirection: "column",
    flex: 1,
  },
  noEventsText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    color: "#555",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 10,
    paddingTop: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#00B4D8",
    justifyContent: "flex-start",
  },
});

export default ReservedEvents;
