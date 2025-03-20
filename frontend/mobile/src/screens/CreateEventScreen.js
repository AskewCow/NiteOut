import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { logoXml } from "../utils/logo";
import { SvgXml } from "react-native-svg";
import { Picker } from "@react-native-picker/picker";
import { db } from "../firebaseConfig";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { useGamer } from "../contexts/GamerContext";

const CreateEventScreen = ({ navigation }) => {
  const { gamerId } = useGamer();
  const [gameType, setGameType] = useState("Seat Based");
  const [numSeats, setNumSeats] = useState("");
  const [numTables, setNumTables] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [expires, setExpires] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    if (!startTime || !endTime || !expires) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    let eventData = {
      game_type: gameType,
      start_time: startTime,
      end_time: endTime,
      expires: expires,
      pub_id: gamerId,
    };

    if (gameType === "Seat Based") {
      if (!numSeats) {
        Alert.alert("Error", "Please specify the number of seats.");
        return;
      }
      eventData.num_seats = parseInt(numSeats);
    } else if (gameType === "Table Based") {
      if (!numTables || !tableCapacity) {
        Alert.alert(
          "Error",
          "Please specify the number of tables and table capacity."
        );
        return;
      }
      eventData.num_tables = parseInt(numTables);
      eventData.table_capacity = parseInt(tableCapacity);
    }

    setLoading(true);

    try {
      const eventRef = await addDoc(collection(db, "events"), eventData);
      await updateDoc(doc(db, "publicans", gamerId), {
        events: eventRef.id,
      });

      Alert.alert("Success", "Event created successfully!");
      navigation.navigate("MyGames");
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity>
            <SvgXml xml={logoXml} width={40} height={40} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>Create Events</Text>
      </View>
      {/* Calendar View */}
      {/* <Calendar
        current={new Date().toISOString().split('T')[0]}
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        style={styles.calendar}
        theme={{
          todayTextColor: '#00B4D8',
        }}
        renderArrow={(direction) => (
          <Text style={{ fontSize: 20, color: 'black' }}>
            {direction === 'left' ? '←' : '→'}
          </Text>
        )}
      /> */}

      {/* <ScrollView style={styles.scrollView}>
        {selectedDate && eventsByDate[selectedDate] ? (
          eventsByDate[selectedDate].map((event, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.eventItem}
              onPress={() => navigation.navigate('EventDetails', { event })}
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
            {selectedDate ? "You have no games on this day." : "Select a date to view games."}
          </Text>
        )}
      </ScrollView> */}
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

export default CreateEventScreen;
