import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { db } from '../firebaseConfig';
import { useGamer } from '../contexts/GamerContext'; 
import { getDoc, doc } from 'firebase/firestore';
import { SvgXml } from "react-native-svg";
import { logoXml } from "../utils/logo";
import { DrawerActions } from '@react-navigation/native';

const ReservedEvents = ({ navigation }) => {
  const { gamerId } = useGamer();
  const [eventsByDate, setEventsByDate] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        console.log("gamerId: ", gamerId);
        const userDoc = await getDoc(doc(db, "gamers", gamerId));
        console.log("here");

        const userData = userDoc.data();
        console.log("Fetched userData ", userData);
        
        if (userData && userData.joined_games) {
            const gamePromises = userData.joined_games.map(gameId => {
            console.log('Fetching game with ID:', gameId);
            
            return getDoc(doc(db, 'games', gameId))  
                .then(docSnapshot => {
                console.log("Got doc: ", docSnapshot);
                return docSnapshot;
                })
                .catch(error => {
                console.error("Error fetching game: ", error);
                return undefined;  
                });
            });

            console.log("game promises: ", gamePromises);

            const gameDocs = await Promise.all(gamePromises);
            console.log("gameDocs: ", gameDocs);
            const newEvents = {};

            gameDocs.forEach(doc => {
                if (doc.exists()) {
                    const gameData = doc.data();
                    const { start_time, game_name, location } = gameData;  
                    const date = new Date(start_time);
                    const formattedDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
                    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });  

                    if (!newEvents[formattedDate]) {
                        newEvents[formattedDate] = [];
                    }
                    newEvents[formattedDate].push({ game_name, start_time, location, time });
                }
            });
          setEventsByDate(newEvents);
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [gamerId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Upcoming reservations</Text>
        <ActivityIndicator size="large" color="#0000ff" />
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
          <View>
              <TouchableOpacity onPress={handleProfilePress}>
                  <SvgXml xml={logoXml} width={40} height={40} />
              </TouchableOpacity>
          </View>
          <Text style={styles.headerText}>My Games</Text>
      </View>
      <ScrollView style={styles.scrollView}>
      {Object.keys(eventsByDate).map(date => (
          <View key={date} style={styles.dateSection}>
          <Text style={styles.dateTitle}>{date}</Text>
          {eventsByDate[date].map((event, index) => (
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
          ))}
          </View>
      ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 10,
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#90E0EF',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  dateSection: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  eventItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: 'row',
  },
  eventTitle: {
    fontSize: 16,
  },
  eventTime: {
    fontSize: 14,
    color: '#555',
    alignSelf: "center",
  },
  eventDetails: {
    flexDirection: 'column',
    flex: 1,
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