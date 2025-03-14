import React, { useState, useEffect, use } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { db, doc, getDoc } from "../firebaseConfig";
import { useLocation } from "../contexts/LocationContext";
import { useGamer } from "../contexts/GamerContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { Modal } from "react-native";
import GamesNearYou from "../components/GamesNearYou";

const GameDetails = ({ route, navigation }) => {
  const { game } = route.params;
  const { userId } = useGamer();
  const [isModalVisible, setModalVisible] = useState(false);
  const [confirmingReservation, setConfirmingReservation] = useState(false);
  const { location } = useLocation();
  const start_date = new Date(game.start_time);
  const end_date = new Date(game.end_time);
  const start_time = start_date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const end_time = end_date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const availableSeats = game.max_players - game.participants.length;

  useEffect(() => {
  }, []);

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const formattedDate = formatDate(start_date);

  const checkUserReservation = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'gamers', userId));
      if (userDoc.exists()) {
        const userEvents = userDoc.data().joined_games || [];
        return userEvents.includes(game.id);
      }
    } catch (error) {
      console.error('Error checking user reservation:', error);
    }
    return false;
  };

  const handleReserveSeat = async () => {
    // Check if user already has a reservation
    const hasReservation = await checkUserReservation();
    if (hasReservation) {
      alert('You already have a reservation for this game.');
      setModalVisible(false);
      return;
    }

    // Proceed with reservation
    try {
      await updateDoc(doc(db, 'games', game.id), {
        participants: arrayUnion(userId),
      });
      await updateDoc(doc(db, 'gamers', userId), {
        events: arrayUnion(game.id),
      });
      setConfirmingReservation(false);
      setModalVisible(false);
      alert('Reservation confirmed!');
    } catch (error) {
      console.error('Error reserving seat:', error);
      alert('Failed to reserve seat. Please try again.');
    }
  };

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No game details available.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="#00B4D8" />
        </TouchableOpacity>
        <Text style={styles.title}>{game.game_name}</Text>
      </View>
      <Text>IMAGE WILL COME HERE ABOVE DESCRIPTION</Text>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>Pub: {game.location}</Text>
        <Text style={styles.description}>Date: {formattedDate}</Text>
        <Text style={styles.description}>Time: {start_time} - {end_time}</Text>
        <Text style={styles.description}>Available seats: {availableSeats}</Text>
      </View>
      {/* <Text style={styles.description}>{game.description || 'No description available.'}</Text> */}

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: game.xcoord,
          longitude: game.ycoord,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
      }}
      >
        { location ? (<Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="You're here!"
          pinColor="blue"
        />
        ) : null}
        <Marker
          coordinate={{ latitude: game.xcoord, longitude: game.ycoord }}
          title={game.location}
          description="Game Location"
        />
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="You're here!"
          pinColor="blue"
        />
      </MapView>
      {/* <TouchableOpacity title="Reserve Seat" onPress={() => setModalVisible(true)} />
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Do you want to confirm your reservation?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              title="Cancel"
              onPress={() => setModalVisible(false)}
            />
            <TouchableOpacity
              title="Confirm"
              onPress={handleReserveSeat}
            />
          </View>
        </View>
      </Modal> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#90E0EF",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
  },
  location: {
    fontSize: 18,
    color: "gray",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  map: {
    width: "95%",
    height: "20%",
    borderRadius: 10,
    paddingBottom: 0,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    width: "100%",
    padding: 10,
    paddingTop: 10,
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    left: 12,
    color: "#FF006E",
  },
  descriptionContainer: {
    backgroundColor: "#FFFFFF",
    width: "95%",
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
});

export default GameDetails;
