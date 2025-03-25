import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getDatabase, ref as dbRef, Database, set, onValue } from "firebase/database";
import "../../global.css";
import defaultStyle from "../styles/defaultStyle"; // Default style
import { useTheme } from "../context/ThemeContext"; // Used for getting if app is in light or dark mode
import { useColorScheme } from "nativewind"; // Used for setting light/dark mode
import Icon from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";

export default function App() {
  // Styling Stuff
  const { t } = useTranslation();
  const { isDarkMode } = useTheme(); 
  const { colorScheme, setColorScheme } = useColorScheme(); 
  setColorScheme(isDarkMode ? "dark" : "light"); 

  // Location Stuff
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  // Default to Ruston if permission denied
  const [lat, setLat] = useState(32.523205);
  const [lng, setLng] = useState(-92.637924);
  const [itemLat, setItemLat] = useState<number>(0);
  const [itemLng, setItemLng] = useState<number>(0);

  const latDelta = 0.00922;
  const lngDelta = 0.00421;

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location DENIED');
        return;
      }

      console.log('Permission to access location GRANTED');
      let location = await Location.getCurrentPositionAsync({});
      console.log(JSON.stringify(location));
      setLocation(location);
      if (location) {
        console.log("\nLocation recieved");
        let locCordsObj = location.coords;
        setLat(locCordsObj.latitude);
        setLng(locCordsObj.longitude);
        console.log("Latitude: " + lat + ", Longitude: " + lng + "\n");
      } else {
        console.log("\nLocation could not be gotten; Defaulting to Ruston Coordinates \n");
      }
    }
    getCurrentLocation();
  }, []);

  ///// Sale Creation Stuff /////

  interface SaleDBObject {
    title: string;
    type: string;
    address: {
        streetAddress: string,
        secondaryAddress: string,
        city: string,
        state: string,
        zipCode: string
    };
    dates: {startDates: string[], endDates: string[]};
    details: string;
    website: string;
    creator: string | undefined;
    id: string;
  }

  interface SaleMapObject {
    title: string;
    type: string;
    address: string;
    latlong: {latitude: number, longitude: number};
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
  const [stateUS, setStateUS] = useState("");
  const [zipCode, setZipCode] = useState("");
  // Dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Misc Sale Creation Stuff
  const [saleType, setSaleType] = useState("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");

  /// Adding and retrieving from DB ///
  const [savedMapList, setSavedMapList] = useState<SaleMapObject[]>([]);
  const [mapItem, setMapItem] = useState<SaleMapObject>();
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
      console.log("RELOAD PAGE CALLED, savedMapList =" + savedMapList);
      const savedSnapshot = snapshot.val();
      console.log("DATA GRABBED, beginning processing");
      for (let item in savedSnapshot) {
        const data = savedSnapshot[item];
        
        // after we grab the item, figure out the lat/long of it, then 
        let locationAddress = data.address.streetAddress;
        locationAddress += ", " + data.address.city;
        locationAddress += ", " + data.address.state;
        let geocode = await getLatLong(locationAddress);
        setMapItem({
          title: data.title,
          type: data.type,
          id: data.id,
          address: locationAddress + " " + data.address.zip_code,
          latlong: {
            latitude: geocode.lat,
            longitude: geocode.long
          },
          dates: data.dates,
          details: data.details,
          website: data.website,
          creator: data.creator
        });
        console.log("LOCATION SHOULD BE PUSHED TO SET");
      }
      resetCreateSale();
    });
    return () => unsubscribe(); // This unmounts the listener when moving between pages
  }, [userUID]);

  useEffect(() => {
    if (mapItem != undefined){
      let notDupe = true;
      for (const loc of savedMapList) {
        if(loc.id === mapItem.id){
          notDupe = false;
          break;
        }
      }
      if(notDupe){
        let currItems = savedMapList;
        currItems.push(mapItem);
        console.log("ITEM SAVED TO MAP LIST, SHOULD NOW BE RENDERING");
        setSavedMapList(currItems);
      } else {
        console.log("ITEM AlREADY IN MAP, NOT RERENDERING");
      }
    }
  }, [mapItem]);

  const getLatLong = (async (address:string) => {
    let lat;
    let long;
    try {
      let geocode = await Location.geocodeAsync(address);
      lat = geocode[0].latitude;
      long = geocode[0].longitude;
      console.log("LATLONG DETERMINED FOR A LOCATION");
    } catch (error) {
      console.error("Geocoding error:", error);
      lat = 32.523205;
      long = -92.637924;
      console.log("LATLONG COULD NOE BE DETERMINED FOR A LOCATION, DEFAULTING");
    }
    return({lat, long});
  })

  const handlePress = () => {
    console.log('Create Button pressed!');
    console.log(savedMapList);
    setCreateSaleModal(true);
  };

  const handleSubmit = () => {
    // Handle button press
    debugLog()
    let requiredFilledOut = checkReqFilled()
    if(requiredFilledOut){
      let saleItem: SaleDBObject = {
        title: saleName,
        type: saleType,
        address: {
          streetAddress: streetAddress,
          secondaryAddress: secondaryStreetAddress,
          city: city,
          state: stateUS,
          zipCode: zipCode
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
      console.log(savedMapList);
    }
    else{ console.log("Error: reqs not filled out") }
  };

  const saveSale = async (item: SaleDBObject) => {
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
  };

  // Calculator states
  const [calcVisible, setCalcVisible] = useState(false);
  const [calcExpression, setCalcExpression] = useState("");
  const [calcResult, setCalcResult] = useState("");

  // Simple method to evaluate the expression
  const handleCalculate = () => {
    try {
      // Evaluate the expression. In real apps, you'd want a safer parser than eval.
      const result = eval(calcExpression);
      setCalcResult(String(result));
    } catch (error) {
      setCalcResult("Error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* MAP CODE*/}
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
        {savedMapList.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.latlong}
            title={marker.title}
          />
        ))}
      </MapView>

      {/* Existing Button*/}
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Icon name="plussquare" size={50} color="black" />
      </TouchableOpacity>

      {/* Calculator Button */}
      <View style={styles.calcButtonContainer}>
        <TouchableOpacity style={styles.calcButton} onPress={() => setCalcVisible(true)}>
          <Text style={styles.calcButtonText}>{t("CalculatorName")}</Text>
        </TouchableOpacity>
      </View>

      {/* Calculator Modal with a functional calculator */}
      <Modal
        visible={calcVisible}
        animationType="slide"
        onRequestClose={() => setCalcVisible(false)}
      >
        <View style={styles.calcModalContainer}>
          <Text style={{ fontSize: 24, marginBottom: 20 }}>{t("CalculatorName")}</Text>

          {/* Calculator UI */}
          <TextInput
            style={{
              width: "80%",
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 10,
              paddingHorizontal: 8,
            }}
            placeholder="Type an expression (e.g. 3+4*2)"
            value={calcExpression}
            onChangeText={setCalcExpression}
          />

          <TouchableOpacity style={styles.calcButton} onPress={handleCalculate}>
            <Text style={styles.calcButtonText}>{t("CalculatorCalculate")}</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 18, marginTop: 10 }}>{t("CalculatorResults")}: {calcResult}</Text>

          <TouchableOpacity
            style={[styles.calcButton, { marginTop: 20 }]}
            onPress={() => setCalcVisible(false)}
          >
            <Text style={styles.calcButtonText}>{t("CloseCalculator")}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Existing Sale Creation Modal (unchanged) */}
      <Modal visible={createSaleModal} animationType='slide' onRequestClose={() => { setCreateSaleModal(false); }}>
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
            {/* End Dates */}
            <View>
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

// Keep the map styles unmodified for the existing map
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
    zIndex: 1, // Ensures the create button stays above the map
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },

  // Calculator button & modal styling
  calcButtonContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    zIndex: 9999,
  },
  calcButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  calcButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  calcModalContainer: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
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
]

// 602 W California Ave