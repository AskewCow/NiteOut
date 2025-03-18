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
import { getDocs, collection, query } from 'firebase/firestore';
import { SvgXml } from "react-native-svg";
import { logoXml } from "../utils/logo";
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

const HostGame = ({ navigation }) => {
  const [eventsByDate, setEventsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  const fetchEvents = async () => {
    try {
      const eventQuery = query(collection(db, 'events'));
      const eventSnapshot = await getDocs(eventQuery);
      const newEvents = {};
      const newMarkedDates = {};

      eventSnapshot.forEach(doc => {
        const eventData = doc.data();
        const { start_time, end_time, pub_details } = eventData;  
        const dateObj = new Date(start_time);
        const formattedDate = dateObj.toISOString().split('T')[0];  
        const startTime = new Date(start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (!newEvents[formattedDate]) {
          newEvents[formattedDate] = [];
        }
        newEvents[formattedDate].push({ ...eventData, startTime, endTime });

        newMarkedDates[formattedDate] = {
          marked: true,
          dotColor: '#FF006E', 
          selectedColor: selectedDate === formattedDate ? '#90E0EF' : undefined,
        };
      });

      setEventsByDate(newEvents);
      setMarkedDates(newMarkedDates);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Available Events</Text>
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
      selectedColor: '#00B4D8',
    };

    setSelectedDate(newSelectedDate);
    setMarkedDates(updatedMarkedDates);
  };

  const handleProfilePress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={handleProfilePress}>
            <SvgXml xml={logoXml} width={40} height={40} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>Host Game</Text>
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
              style={styles.eventItem}
              onPress={() => navigation.navigate('ChosenEvent', { event })}
            > 
              <View style={styles.eventDetails}>
                <Text style={styles.pubName}>{event.pub_details.pub_name}</Text>
                <Text style={styles.eventTime}>{`${event.startTime} - ${event.endTime}`}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEventsText}>
            {selectedDate ? "No events available on this day." : "Select a date to view events."}
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
  calendar :{
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
    justifyContent: 'space-between',
  },
  pubName: {
    fontSize: 16,
  },
  eventTime: {
    fontSize: 14,
    color: '#555',
    alignSelf: "center",
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});

export default HostGame;