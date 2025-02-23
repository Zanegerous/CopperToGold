import React, { useState, useEffect } from 'react';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, View } from 'react-native';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  // Default to Ruston if permission denied
  const [lat, setLat] = useState(32.523205);
  const [lng, setLng] = useState(-92.637924);

  const latDelta = 0.00922
  const lngDelta = 0.00421

  useEffect(() => {
    async function getCurrentLocation() {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location DENIED');
        return;
      }

      console.log('Permission to access location GRANTED');
      let location = await Location.getCurrentPositionAsync({});
      console.log(JSON.stringify(location))
      setLocation(location);
      if (location) {
        console.log("\nLocation recieved")
        let locCordsObj = location.coords;
        setLat(locCordsObj.latitude);
        setLng(locCordsObj.longitude);
        console.log("Latitude: " + lat + ", Longitude: " + lng + "\n")
      } else {
        console.log("\nLocation could not be gotten; Defaulting to Ruston Coordinates \n")
      }
    }

    getCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        region={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }}
        showsUserLocation={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});