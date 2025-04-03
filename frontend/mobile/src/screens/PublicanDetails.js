"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { db } from "../firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";

const PublicanDetails = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState({
    latitude: 51.5074, // Default to London
    longitude: -0.1278,
  });

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          setEventDetails(data);

          // Set coordinates if available in the data
          if (data.pub_details && data.pub_details.coordinates) {
            setCoordinates({
              latitude: data.pub_details.coordinates.latitude || 51.5074,
              longitude: data.pub_details.coordinates.longitude || -0.1278,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        Alert.alert("Error", "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleCancelEvent = async () => {
    try {
      Alert.alert(
        "Cancel Event",
        "Are you sure you want to cancel this event? This action cannot be undone.",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes",
            onPress: async () => {
              await deleteDoc(doc(db, "events", eventId));
              Alert.alert("Success", "Event cancelled successfully");
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error cancelling event:", error);
      Alert.alert("Error", "Failed to cancel event");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
      </View>
    );
  }

  if (!eventDetails) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={30} color="#00B4D8" />
          </TouchableOpacity>
          <Text style={styles.title}>Event Details</Text>
        </View>
        <Text style={styles.errorText}>Event not found</Text>
      </SafeAreaView>
    );
  }

  const startTime = moment(eventDetails.start_time).format("h:mm A");
  const endTime = moment(eventDetails.end_time).format("h:mm A");
  const formattedDate = moment(eventDetails.start_time).format("MMMM Do");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color="#00B4D8" />
        </TouchableOpacity>
        <Text style={styles.title}>Event Details</Text>
      </View>

      <ScrollView>
        {/* Event Details Container */}
        <View style={styles.detailsContainer}>
          <View style={styles.leftContainer}>
            {/* Pub Name */}
            <Text style={styles.pubName}>
              {eventDetails.pub_details.pub_name}
            </Text>

            {/* Address */}
            <Text style={styles.hostText}>Location</Text>
            <Text style={styles.descriptionText}>
              {eventDetails.pub_details.pub_address}
            </Text>

            <Text style={styles.hostText}>Start Date</Text>
            <Text style={styles.descriptionText}>{formattedDate}</Text>

            <Text style={styles.hostText}>Time</Text>
            <Text style={styles.descriptionText}>
              {" "}
              {startTime} - {endTime}{" "}
            </Text>
            {/* Number of Seats */}
            <Text style={styles.hostText}>Maxiumum Capacity</Text>
            <Text style={styles.descriptionText}>
              {eventDetails.num_seats} seats
            </Text>
          </View>
        </View>

        {/* Available Slots */}
        {eventDetails.available_slots &&
          Object.keys(eventDetails.available_slots).length > 0 && (
            <View style={styles.slotsContainer}>
              <Text style={styles.slotsTitle}>Available Time Slots</Text>
              <View style={styles.slotsList}>
                {Object.entries(eventDetails.available_slots).map(
                  ([slot, count]) => (
                    <View key={slot} style={styles.slotItem}>
                      <Text style={styles.slotTime}>{slot}</Text>
                      <Text style={styles.slotCount}>{count} seats</Text>
                    </View>
                  )
                )}
              </View>
            </View>
          )}

        {/* Map View */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            }}
            title={eventDetails.pub_details.pub_name}
            description={eventDetails.pub_details.pub_address}
          />
        </MapView>

        {/* Cancel Event Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelEvent}
        >
          <Text style={styles.cancelButtonText}>Cancel Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#90E0EF",
    justifyContent: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#90E0EF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 10,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 12,
    color: "#FF006E",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  detailsContainer: {
    flexDirection: "row",
    padding: 20,
    margin: 10,
    backgroundColor: "#FFFF",
    borderRadius: 20,
    alignItems: "center",
  },
  leftContainer: {
    flex: 1,
    marginRight: 0,
    width: "100%",
  },
  pubName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FF006E",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  pill: {
    backgroundColor: "#00B4D8",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    alignSelf: "flex-start",
    width: "48%",
  },
  dateTimePillText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  pillText: {
    color: "white",
    fontSize: 27,
    textAlign: "center",
  },
  map: {
    width: "95%",
    height: 200,
    borderRadius: 20,
    paddingBottom: 0,
    alignSelf: "center",
    marginVertical: 10,
  },
  descriptionText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: "left",
    width: "100%",
  },
  hostText: {
    fontSize: 16,
    marginBottom: 2,
    textAlign: "left",
    width: "100%",
    color: "#00B4D8",
  },
  cancelButton: {
    alignSelf: "center",
    backgroundColor: "#FF006E",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    width: "90%",
    marginVertical: 20,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  slotsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    margin: 10,
  },
  slotsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00B4D8",
    marginBottom: 10,
  },
  slotsList: {
    marginTop: 5,
  },
  slotItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  slotTime: {
    fontSize: 16,
  },
  slotCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF006E",
  },
});

export default PublicanDetails;
