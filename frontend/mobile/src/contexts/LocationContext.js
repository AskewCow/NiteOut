import * as Location from "expo-location";
import React, { createContext, useState, useEffect, useContext } from "react";

import { NGROK_URL } from "../../environment";
const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("status: ", status);
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
        console.log("Location: ", location);
        console.log("NGROK_URL:", NGROK_URL);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
