import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { useGamer } from '../contexts/GamerContext'; 
import { getDoc, doc } from 'firebase/firestore';

const ReservedEvents = ({ navigation }) => {
  const { gamerId } = useGamer();
  const [eventsByDate, setEventsByDate] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // Fetch user document
        console.log("gamerId: ", gamerId);
        const userDoc = await getDoc(doc(db, "gamers", gamerId));
        console.log("here");

        const userData = userDoc.data();
        console.log("Fetched userData ", userData);
        
        if (userData && userData.joined_games) {
          const gamePromises = userData.joined_games.map(gameId =>  {
            console.log('Fetching game with ID:', gameId);
            getDoc(doc(db, 'games', gameId))
            });
          
          const gameDocs = await Promise.all(gamePromises);
          const newEventsByDate = {};

          gameDocs.forEach(doc => {
            if (doc.exists) {
              const gameData = doc.data();
              const { start_time, title } = gameData;  
              const date = start_time.split('T')[0];  

              if (!newEventsByDate[date]) {
                newEventsByDate[date] = [];
              }

              newEventsByDate[date].push({ title, start_time });
            }
          });

          setEventsByDate(newEventsByDate);
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
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
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
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventTime}>{event.start_time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  eventTitle: {
    fontSize: 16,
  },
  eventTime: {
    fontSize: 14,
    color: '#555',
  },
});

export default ReservedEvents;