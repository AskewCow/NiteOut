import React, { useEffect } from "react";
import { Text, StyleSheet, View, Button, TouchableOpacity } from "react-native";


const MapScreen = ({ navigation }) => {
  useEffect(() => {
    console.log("MapScreen component mounted");
  }, []);

  return (
      <View>
        <Text style={styles.text}>You are now on map screen</Text>
        <Button 
          onPress={() => navigation.navigate('PracticeHome')}
          title="back to practice home" 
        />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    text: {
      fontSize: 30,
    },
  });
  
  export default MapScreen;