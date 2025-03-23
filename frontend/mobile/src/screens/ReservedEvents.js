import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { db } from '../firebaseConfig';
import { useGamer } from '../contexts/GamerContext'; 
import { getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { SvgXml } from "react-native-svg";
import { logoXml } from "../utils/logo";
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

const ReservedEvents = ({ navigation }) => {
  const { gamerId } = useGamer();
  const [eventsByDate, setEventsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  const handleGamePress = async (gameId) => {
    try {
      const gameDoc = await getDoc(doc(db, "games", gameId));
      if (gameDoc.exists()) {
        const fullGameData = { id: gameDoc.id, ...gameDoc.data() };
        navigation.navigate("GameDetails", { game: fullGameData });
      } else {
        alert("Game not found!");
      }
    } catch (error) {
      console.error("Error fetching game details:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      console.log("gamerId: ", gamerId);
      const userDoc = await getDoc(doc(db, "gamers", gamerId));

      const userData = userDoc.data();
      const newEvents = {};
      const newMarkedDates = {};
      
      // Fetch joined games
      if (userData && userData.joined_games) {
        const gamePromises = userData.joined_games.map(gameId => 
          getDoc(doc(db, 'games', gameId)).catch(error => {
            console.error("Error fetching game: ", error);
            return undefined;
          })
        );

        const gameDocs = await Promise.all(gamePromises);
        console.log("joined games: ", gameDocs);

        gameDocs.forEach(doc => {
          if (doc && doc.exists()) {
            const gameData = doc.data();
            const { start_time, game_name, location } = gameData;  
            const dateObj = new Date(start_time);
            const formattedDate = dateObj.toISOString().split('T')[0];  
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            if (!newEvents[formattedDate]) {
              newEvents[formattedDate] = [];
            }
            
            newEvents[formattedDate].push({ 
              id: doc.id,
              game_name, 
              start_time, 
              location, 
              time,
              isHosted: false 
            });

            if (!newMarkedDates[formattedDate]) {
              newMarkedDates[formattedDate] = {
                dots: [{ color: '#FF006E', key: 'joined' }],
                selected: selectedDate === formattedDate,
                selectedColor: '#90E0EF'
              };
            } else if (!newMarkedDates[formattedDate].dots.some(dot => dot.key === 'joined')) {
              newMarkedDates[formattedDate].dots.push({ color: '#FF006E', key: 'joined' });
            }
          }
        });
      }
      
      // Fetch hosted games
      const gamesQuery = query(collection(db, 'games'), where('host', '==', gamerId));
      const hostedGamesSnapshot = await getDocs(gamesQuery);
      
      console.log("hosted games: ", hostedGamesSnapshot.size);
      
      hostedGamesSnapshot.forEach(doc => {
        const gameData = doc.data();
        const { start_time, game_name, location } = gameData;
        const dateObj = new Date(start_time);
        const formattedDate = dateObj.toISOString().split('T')[0];
        const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (!newEvents[formattedDate]) {
          newEvents[formattedDate] = [];
        }
        
        const existingGameIndex = newEvents[formattedDate].findIndex(game => game.id === doc.id);
        if (existingGameIndex >= 0) {
          newEvents[formattedDate][existingGameIndex].isHosted = true;
        } else {
          newEvents[formattedDate].push({ 
            id: doc.id,
            game_name, 
            start_time, 
            location, 
            time,
            isHosted: true 
          });
        }
        
        if (!newMarkedDates[formattedDate]) {
          newMarkedDates[formattedDate] = {
            dots: [{ color: '#FFB6C1', key: 'hosted' }],
            selected: selectedDate === formattedDate,
            selectedColor: '#90E0EF'
          };
        } else if (!newMarkedDates[formattedDate].dots.some(dot => dot.key === 'hosted')) {
          newMarkedDates[formattedDate].dots.push({ color: '#FFB6C1', key: 'hosted' });
        }
      });

      setEventsByDate(newEvents);
      setMarkedDates(newMarkedDates);
    } catch (error) {
      console.error('Error fetching reservations:', error);
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
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Upcoming reservations</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleDateSelect = (date) => {
    const newSelectedDate = date.dateString;
    const updatedMarkedDates = { ...markedDates };
    
    // Reset selection on all dates
    Object.keys(updatedMarkedDates).forEach(key => {
      updatedMarkedDates[key] = { 
        ...updatedMarkedDates[key], 
        selected: false 
      };
    });
    
    // Mark the new selected date
    if (updatedMarkedDates[newSelectedDate]) {
      updatedMarkedDates[newSelectedDate] = {
        ...updatedMarkedDates[newSelectedDate],
        selected: true,
        selectedColor: '#00B4D8',
      };
    } else {
      updatedMarkedDates[newSelectedDate] = {
        dots: [],
        selected: true,
        selectedColor: '#00B4D8',
      };
    }

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
        current={new Date().toISOString().split('T')[0]}
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        style={styles.calendar}
        theme={{
          todayTextColor: '#00B4D8',
        }}
        markingType={'multi-dot'}
        renderArrow={(direction) => (
          <Text style={{ fontSize: 20, color: 'black' }}>
            {direction === 'left' ? '←' : '→'}
          </Text>
        )}
      />

      {/* Event List */}
      <ScrollView style={styles.scrollView}>
        {selectedDate && eventsByDate[selectedDate] ? (
          eventsByDate[selectedDate].map((event, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.eventItem, 
                event.isHosted ? styles.hostedEventItem : {}
              ]}
              onPress={() => handleGamePress(event.id)}
            > 
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.game_name}</Text>
                <Text style={styles.pubName}>{event.location}</Text>
                {event.isHosted && <Text style={styles.hostBadge}>Host</Text>}
              </View>
              <Text style={styles.eventTime}>{event.time}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEventsText}>
            {selectedDate ? "You have no games on this day." : "Select a date to view games."}
          </Text>
        )}
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
    backgroundColor: '#90E0EF',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 10,
  },
  eventItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: 'row',
  },
  hostedEventItem: {
    backgroundColor: '#FFB6C1', // Light pink color for hosted games
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
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#555',
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pubName: {
    fontSize: 14,
    color: '#555',
  },
  hostBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF006E',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
});

export default ReservedEvents;