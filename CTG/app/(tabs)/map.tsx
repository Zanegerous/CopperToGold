import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getDatabase, ref as dbRef, Database, set, onValue } from "firebase/database";
import "../../global.css";
import defaultStyle from "../styles/defaultStyle"; // Default style
import { useTheme } from "../context/ThemeContext"; // Used for getting if app is in light or dark mode
import { useColorScheme } from "nativewind"; // Used for setting light/dark mode
import Icon from "react-native-vector-icons/AntDesign";

export default function App() {
  // Styling Stuff
  const { isDarkMode } = useTheme(); // Get if app is in light or dark mode
  const { colorScheme, setColorScheme } = useColorScheme(); // Set up for NativeWind
  setColorScheme(isDarkMode ? "dark" : "light"); // Automatically set if the page is in light or dark mode

  // Location Stuff
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

  ///// Sale Creation Stuff /////

  interface SaleObject {
    title: string;
    type: string;
    address: {
        streetAddress: string,
        secondaryAddress: string,
        city: string,
        state: string,
        zip_code: string
    };
    dates: {startDates: string[], endDates: string[]};
    details: string;
    website: string;
    creator: string | undefined;
    id: string;
  }

  const [createSaleModal, setCreateSaleModal] = useState(false);
  const [saleName, setSaleName] = useState("");
  // Address
  const [streetAddress, setStreetAddress] = useState("");
  const [secondaryStreetAddress, setSecondaryStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateUS, setStateUS] = useState(""); // state as in the state in America. Might try to come up with a better name for this later.
  const [zipCode, setZipCode] = useState("");
  // Dates
  // const [startDate, setStartDate] = useState<Date | null>(null); This is the correct one, fix this later
  const [startDate, setStartDate] = useState("");
  const [startDateList, setStartDateList] = useState([]);
  // const [endDate, setEndDate] = useState<Date | null>(null); This is the correct one, fix this later
  const [endDate, setEndDate] = useState("");
  const [endDates, setEndDates] = useState([]);
  // Misc Sale Creation Stuff
  const [saleType, setSaleType] = useState("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");

  /// Adding and retrieving from DB ///
  const [savedList, setSavedList] = useState<SaleObject[]>([]);
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userUID, setUserUID] = useState<string | undefined>(user?.uid);
  const [database, setDatabase] = useState<Database>(getDatabase());
  const saveRef = dbRef(database, "sales/");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserUID(user?.uid);
      setDatabase(getDatabase());
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onValue(saveRef, async (snapshot) => { // This creates a mounting point to listen to the savedItems position for updates.
      const savedSnapshot = snapshot.val();
      const savedSet: SaleObject[] = [];
      for (let item in savedSnapshot) {
        const data = savedSnapshot[item];
        savedSet.push({
          title: data.title,
          type: data.type,
          id: data.id,
          address: data.address,
          dates: data.dates,
          details: data.details,
          website: data.website,
          creator: data.creator
        });
      }
      setSavedList(savedSet);
      resetCreateSale();
    });
    return () => unsubscribe(); // This unmounts the listener when moving between pages
  }, []);

  useEffect(() => {
    // when saved list changes (i.e., if a new sale is added) print it
    console.log(savedList)
  }, [savedList])

  const parseDesc = (desc : string, startDate : Date, endDate : Date) => {
    // let returnStr : string = desc + "\n"
    let stDateDMY = startDate.toLocaleDateString("en-US")
    let stDateHMS = new Intl.DateTimeFormat("en-US", {timeStyle: "short"}).format(startDate)
    let returnStr = stDateDMY + " at " + stDateHMS;
    // let endDateDMY = endDate.toLocaleDateString("en-US")
    // let endDateHMS = new Intl.DateTimeFormat("en-US", {timeStyle: "short"}).format(endDate)
    // returnStr += "End: " + endDateDMY + " at " + endDateHMS;
    return returnStr
  }

  const handlePress = () => {
    // Handle button press
    console.log('Create Button pressed!');
    setCreateSaleModal(true);
  };

  const handleSubmit = () => {
    // Handle button press
    debugLog()
    let requiredFilledOut = checkReqFilled()
    if(requiredFilledOut){
      let saleItem: SaleObject = {
        title: saleName,
        type: saleType,
        address: {
          streetAddress: streetAddress,
          secondaryAddress: secondaryStreetAddress,
          city: city,
          state: stateUS,
          zip_code: zipCode
        },
        dates: {
          startDates: [startDate],
          endDates: [endDate]
        },
        details: details,
        website: website,
        creator: userUID,
        id: ''
      }
      saveSale(saleItem);
      setCreateSaleModal(false);
    }
    else{ console.log("Error: reqs not filled out") }
  };

  const saveSale = async (item: SaleObject) => {
    item.id = `${item.title}_${Date.now()}`
    const saveRef = `sales/${item.id}`
    const itemRef = dbRef(database, saveRef);
    try {
      await set(itemRef, {
        title: item.title,
        type: item.type,
        address: item.address,
        dates: item.dates,
        details: item.details,
        website: item.website,
        creator: item.creator,
        id: item.id
      });
      console.log('Saved Sale: ', item.title)
    } catch (error: any) {
      console.error("Save Error: ", error);
    }
  }

  const debugLog = () => {
    console.log('Submit Button pressed!');
    console.log("Sale Name = " + saleName);
    console.log('Address Info');
    console.log("\tAddress = " + streetAddress);
    console.log("\tApt/Suite = " + secondaryStreetAddress);
    console.log("\tCity = " + city);
    console.log("\tState = " + stateUS);
    console.log("\tZip Code = " + zipCode);
    console.log("Dates");
    console.log("\tStart Date = " + startDate);
    console.log("\tEnd Date = " + endDate);
    console.log("Details = " + details);
    console.log("Website = " + website);
  }

  // This may be the ugliest function of all time
  const checkReqFilled = () => {
    let reqFilled = true;
    let valsMissing : string[] = [];
    if(saleName == '') {
      reqFilled = false
      valsMissing.push('Sale Name');
    }
    if(saleType == '') {
      reqFilled = false
      valsMissing.push('Sale Type');
    }
    if(streetAddress == '') {
      reqFilled = false
      valsMissing.push('Street Address');
    }
    if(city == '') {
      reqFilled = false
      valsMissing.push('City');
    }
    if(stateUS == '') {
      reqFilled = false
      valsMissing.push('State');
    }
    if(zipCode == '') {
      reqFilled = false
      valsMissing.push('Zip Code');
    }
    if(startDate == '') {
      reqFilled = false
      valsMissing.push('Start Date of Sale');
    }
    if(endDate == '') {
      reqFilled = false
      valsMissing.push('End Date of Sale');
    }
    if(reqFilled == false){
      let missingStr = "You cannot submit this sale without the following data:\n"
      for(let val of valsMissing){
        missingStr += val + ", "
      }
      let finalStr = missingStr.slice(0, -2); // remove the ", " on the end of the last item.
      Alert.alert("Error: Missing Data", finalStr);
      console.error("Error: Missing Data\n" + finalStr);
    }
    return(reqFilled);
  }

  const resetCreateSale = () => {
    setSaleName('');
    setSaleType('');
    setStreetAddress('');
    setSecondaryStreetAddress('');
    setCity('');
    setStateUS('');
    setZipCode('');
    setStartDate('');
    setEndDate('');
    setDetails('');
    setWebsite('');
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
        showsMyLocationButton={true}
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
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Icon name="plussquare" size={50} color="black" />
      </TouchableOpacity>
      <Modal visible={createSaleModal} animationType='slide' onRequestClose={() => { setCreateSaleModal(false) }}>
        <View>
          <TouchableOpacity className={`${defaultStyle.button} bg-red-600`} onPress={ () => { 
            setCreateSaleModal(false)
            resetCreateSale()
          }}>
            <Text className={`${defaultStyle.buttonText}`}>
              Cancel
            </Text>
          </TouchableOpacity>
          {/* Sale Name */}
          <View className="w-full mb-4">
            <Text className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Sale Name
            </Text>
            <TextInput 
              className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
              placeholder="Enter the name of your sale"
              placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
              autoCapitalize="none"
              keyboardType="default"
              onChangeText={setSaleName}
              value={saleName}
            />
          </View>
          {/* Address Stuff */}
          <View className="w-full mb-4">
            <Text className={`${defaultStyle.text} text-center`}>
              Address information
            </Text>
            {/* Street Address */}
            <View>
              <Text className={`${defaultStyle.text}`}>
                Street Address
              </Text>
              <TextInput 
                className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
                autoCapitalize="none"
                keyboardType="default"
                onChangeText={setStreetAddress}
                value={streetAddress}
              />
            </View>
            {/* Apt/Suite */}
            <View>
              <Text className={`${defaultStyle.text}`}>
                Apt/Suite
              </Text>
              <TextInput 
                className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
                autoCapitalize="none"
                keyboardType="default"
                onChangeText={setSecondaryStreetAddress}
                value={secondaryStreetAddress}
              />
            </View>
            {/* City */}
            <View>
              <Text className={`${defaultStyle.text}`}>
                City
              </Text>
              <TextInput 
                className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
                autoCapitalize="none"
                keyboardType="default"
                onChangeText={setCity}
                value={city}
              />
            </View>
            {/* State */}
            <View>
              <Text className={`${defaultStyle.text}`}>
                State
              </Text>
              {/* TODO: Turn this into a dropdown menu */}
              <TextInput 
                className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
                autoCapitalize="none"
                keyboardType="default"
                onChangeText={setStateUS}
                value={stateUS}
              />
            </View>
            {/* Zip Code */}
            <View>
              <Text className={`${defaultStyle.text}`}>
                Zip Code
              </Text>
              <TextInput 
                className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
                autoCapitalize="none"
                keyboardType="default"
                onChangeText={setZipCode}
                value={zipCode}
              />
            </View>
          </View>
          <View>
            {/* Date Stuff */}
            <Text className={`${defaultStyle.text} text-center`}>
              Date Information
            </Text>
            {/* TODO: Allow users to actually input multiple dates */}
            <View>
              {/* Start Dates */}
              <Text className={`${defaultStyle.text}`}>
                Start Dates
              </Text>
              <TextInput 
                className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
                autoCapitalize="none"
                keyboardType="default"
                onChangeText={setStartDate}
                value={startDate}
              />
            </View>
            <View>
              {/* End Dates */}
              <Text className={`${defaultStyle.text}`}>
                End Dates
              </Text>
              <TextInput 
                className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
                autoCapitalize="none"
                keyboardType="default"
                onChangeText={setEndDate}
                value={endDate}
              />
            </View>
          <Text className={`${defaultStyle.text} text-center`}>
            Other Information
          </Text>
          </View>
          {/* Details */}
          <View>
            <Text className={`${defaultStyle.text}`}>
              Details
            </Text>
            <TextInput 
              className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
              autoCapitalize="none"
              keyboardType="default"
              placeholder="Add any extra details about your sale here"
              placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
              onChangeText={setDetails}
              value={details}
            />
          </View>
          {/* Sale Type */}
          <View>
            <Text className={`${defaultStyle.text}`}>
              Sale Type
            </Text>
            {/* TODO: Make this a drop down menu */}
            <TextInput 
              className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
              autoCapitalize="none"
              keyboardType="default"
              placeholder=""
              placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
              onChangeText={setSaleType}
              value={saleType}
            />
          </View>
          {/* Website */}
          <View>
            <Text className={`${defaultStyle.text}`}>
              Other places this sale can be found
            </Text>
            <TextInput 
              className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"}`}
              autoCapitalize="none"
              keyboardType="default"
              placeholder="If your sale is listed on any other websites (e.g., estatesales.net) list them here"
              placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
              onChangeText={setWebsite}
              value={website}
            />
          </View>
          <TouchableOpacity className={`${defaultStyle.button}`} onPress={handleSubmit}>
            <Text className={`${defaultStyle.buttonText}`}>
              List your sale!
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  button: {
    position: 'absolute',
    top: 20,
    right: 350,
    padding: 5,
    borderRadius: 5,
    zIndex: 1, // Ensures the button stays above the map
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});


const sales = [
  {
    latlng : {latitude: 32.523205, longitude: -92.637924},
    title: "Father Estate Sale",
    desc: "Trying to clear out our father's house",
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