import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';

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

  let parseDesc = (desc : string, startDate : Date, endDate : Date) => {
    // let returnStr : string = desc + "\n"
    let stDateDMY = startDate.toLocaleDateString("en-US")
    let stDateHMS = new Intl.DateTimeFormat("en-US", {timeStyle: "short"}).format(startDate)
    let returnStr = stDateDMY + " at " + stDateHMS;
    // let endDateDMY = endDate.toLocaleDateString("en-US")
    // let endDateHMS = new Intl.DateTimeFormat("en-US", {timeStyle: "short"}).format(endDate)
    // returnStr += "End: " + endDateDMY + " at " + endDateHMS;
    return returnStr
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView 
        style={styles.map} 
        region={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }}
        showsUserLocation={true}
      >
        {sales.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.latlng}
            title={marker.title}
            description={parseDesc(marker.desc, marker.startDate, marker.endDate)}
          />
        ))}
      </MapView>
    </SafeAreaView>
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


const sales = [
  {
    latlng : {latitude: 32.523205, longitude: -92.637924},
    title: "Roommate Estate Sale",
    desc: "My roommate died so I'm selling all of his stuff before his family gets here.",
    startDate: new Date(2025,2,24,16,0,0),
    endDate: new Date(2025,2,24,20,0,0)
  },
  {
    latlng : {latitude: 32.554098, longitude: -92.656846},
    title: "Garage Sale",
    desc: "We're having a garage sale this weekend!",
    startDate: new Date(2025,3,1,10,0,0),
    endDate: new Date(2025,3,2,16,0,0)
  },
  {
    latlng : {latitude: 32.521495, longitude: -92.646795},
    title: "Grandma Estate Sale",
    desc: "My grandma died and we're trying to clean out her house.",
    startDate: new Date(2025,3,8,8,0,0),
    endDate: new Date(2025,3,8,20,0,0)
  },
  { // 32.523263, -92.641027
    latlng : {latitude: 32.523263, longitude: -92.641027},
    title: "BIG ESTATE SALE",
    desc: "",
    startDate: new Date(2025,5,4,10,0,0),
    endDate: new Date(2025,5,4,18,0,0)
  }
]