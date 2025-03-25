import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
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

  let parseDesc = (desc: string, startDate: Date, endDate: Date) => {
    let stDateDMY = startDate.toLocaleDateString("en-US");
    let stDateHMS = new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(startDate);
    let returnStr = stDateDMY + " at " + stDateHMS;
    return returnStr;
  };

  const handlePress = () => {
    console.log('Create Button pressed!');
    setCreateSaleModal(true);
  };

  const handleSubmit = () => {
    debugLog();
    resetCreateSale();
  };

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
  };

  const resetCreateSale = () => {
    setCreateSaleModal(false);
    setSaleName('');
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
        {sales.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.latlng}
            title={marker.title}
            description={parseDesc(marker.desc, marker.startDate, marker.endDate)}
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
          <TouchableOpacity className={`${defaultStyle.button} bg-red-600`} onPress={resetCreateSale}>
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
                ZipCode
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
            {/* Start Dates */}
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
    top: 20,
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
  {
    latlng : {latitude: 32.521495, longitude: -92.646795},
    title: "Grandma Estate Sale",
    desc: "My grandma died and we're trying to clean out her house.",
    startDate: new Date(2025,3,8,8,0,0),
    endDate: new Date(2025,3,8,20,0,0)
  },
  {
    latlng : {latitude: 32.523263, longitude: -92.641027},
    title: "BIG ESTATE SALE",
    desc: "",
    startDate: new Date(2025,5,4,10,0,0),
    endDate: new Date(2025,5,4,18,0,0)
  }
];
