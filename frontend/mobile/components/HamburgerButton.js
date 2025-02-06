import React, { useState } from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const HamburgerButton = ({ onPress }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    setIsOpen(!isOpen);
    if (onPress) onPress(isOpen);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image
        source={isOpen ? require('../assets/logo2.png') : require('../assets/logo2.png')}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 50, 
    height: 50, 
    resizeMode: 'contain', 
    borderRadius: 10
  },
});

export default HamburgerButton;
