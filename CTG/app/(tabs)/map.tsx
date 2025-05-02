import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, ScrollView, Text, TextInput, Modal, Alert, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker, Region } from 'react-native-maps';
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
  /// Styling Stuff ///
  const { t } = useTranslation();
  const { isDarkMode } = useTheme(); 
  const { colorScheme, setColorScheme } = useColorScheme(); 
  setColorScheme(isDarkMode ? "dark" : "light"); 

  // Location Stuff ///
  const mapRef = useRef<MapView | null>(null);
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
  const [zipCode, setZipCode] = useState("");
  // State Drop Down Stuff
  const [itemsStateDD, setItemsStateDD] = useState([{label:"Alabama", value:"AL"},{label:"Alaska", value:"AK"},{label:"Arizona", value:"AZ"},{label:"Arkansas", value:"AR"},{label:"California", value:"CA"},{label:"Colorado", value:"CO"},{label:"Connecticut", value:"CT"},{label:"Delaware", value:"DE"},{label:"Florida", value:"FL"},{label:"Georgia", value:"GA"},{label:"Hawaii", value:"HI"},{label:"Idaho", value:"ID"},{label:"Illinois", value:"IL"},{label:"Indiana", value:"IN"},{label:"Iowa", value:"IA"},{label:"Kansas", value:"KS"},{label:"Kentucky", value:"KY"},{label:"Louisiana", value:"LA"},{label:"Maine", value:"ME"},{label:"Maryland", value:"MD"},{label:"Massachusetts", value:"MA"},{label:"Michigan", value:"MI"},{label:"Minnesota", value:"MN"},{label:"Mississippi", value:"MS"},{label:"Missouri", value:"MO"},{label:"Montana", value:"MT"},{label:"Nebraska", value:"NE"},{label:"Nevada", value:"NV"},{label:"New Hampshire", value:"NH"},{label:"New Jersey", value:"NJ"},{label:"New Mexico", value:"NM"},{label:"New York", value:"NY"},{label:"North Carolina", value:"NC"},{label:"North Dakota", value:"ND"},{label:"Ohio", value:"OH"},{label:"Oklahoma", value:"OK"},{label:"Oregon", value:"OR"},{label:"Pennsylvania", value:"PA"},{label:"Rhode Island", value:"RI"},{label:"South Carolina", value:"SC"},{label:"South Dakota", value:"SD"},{label:"Tennessee", value:"TN"},{label:"Texas", value:"TX"},{label:"Utah", value:"UT"},{label:"Vermont", value:"VT"},{label:"Virginia", value:"VA"},{label:"Washington", value:"WA"},{label:"West Virginia", value:"WV"},{label:"Wisconsin", value:"WI"},{label:"Wyoming", value:"WY"}])
  const [openStateDD, setOpenStateDD] = useState(false);
  const [stateUS, setStateUS] = useState<string>("");
  // Dates
  const [startDateList, setStartDateList] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date(0));
  const [startDateMode, setStartDateMode] = useState<'date' | 'time'>('date');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [startDateString, setStartDateString] = useState<string>("");
  const dateOptions:any = { dateStyle: "short", timeStyle: "short" };
  const dateStrFormat = new Intl.DateTimeFormat(undefined, dateOptions);
  const [endDateList, setEndDateList] = useState<Date[]>([]);
  const [endDate, setEndDate] = useState<Date>(new Date(0));
  const [endDateMode, setEndDateMode] = useState<'date' | 'time'>('date');
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [endDateString, setEndDateString] = useState<string>("");
  // Misc Sale Creation Stuff
  const [saleTypeDD, setSaleTypeDD] = useState([{label:"Estate Sale", value:"Estate"},{label:"Garage Sale", value:"Garage"},{label:"Other", value:"Other"}]);
  const [openSaleTypeDD, setOpenSaleTypeDD] = useState(false);
  const [saleType, setSaleType] = useState<string>("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");

  const onChangeStartDate = (event: any, selectedDate: any) => {
    setShowStartDatePicker(false);
    if (event.type == 'set'){
      const currentDate = selectedDate;
      setStartDate(currentDate);
      let dateStr = dateStrFormat.format(currentDate);
      setStartDateString(dateStr)
      if(startDateMode === 'date'){
        const tempDate = new Date(selectedDate);
        tempDate.setHours(
          endDate.getHours(),
          endDate.getMinutes(),
          endDate.getSeconds(),
          endDate.getMilliseconds()
        );
        setEndDate(tempDate);
        let endDateStr = dateStrFormat.format(tempDate);
        setEndDateString(endDateStr)
      }
    }
    
  };

  const showStartMode = (currentMode:"date" | "time") => {
    setShowStartDatePicker(true);
    setStartDateMode(currentMode);
  };

  const onChangeEndDate = (event: any, selectedDate: any) => {
    setShowEndDatePicker(false);
    if(event.type == "set"){
      const currentDate = selectedDate;
      setShowEndDatePicker(false);
      setEndDate(currentDate);
      const dateOptions:any = { dateStyle: "short", timeStyle: "short" };
      let endDateStr = new Intl.DateTimeFormat(undefined, dateOptions).format(currentDate);
      setEndDateString(endDateStr);
    }
  };

  const showEndMode = (currentMode:"date" | "time") => {
    setShowEndDatePicker(true);
    setEndDateMode(currentMode);
  };

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
      // console.log("RELOAD PAGE CALLED, savedMapList =" + savedMapList);
      const savedSnapshot = snapshot.val();
      // console.log("DATA GRABBED, beginning processing");
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
          address: locationAddress + " " + data.address.zipCode,
          latlong: {
            latitude: geocode.lat,
            longitude: geocode.long
          },
          dates: data.dates,
          details: data.details,
          website: data.website,
          creator: data.creator
        });
        // console.log("LOCATION SHOULD BE PUSHED TO SET");
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
        // console.log("ITEM SAVED TO MAP LIST, SHOULD NOW BE RENDERING");
        setSavedMapList(currItems);
      } else {
        // console.log("ITEM AlREADY IN MAP, NOT RERENDERING");
      }
    }
  }, [mapItem]);

  /// Handling Displaying Data on Map ///
  const emptySale : SaleMapObject = {
    title: "NULL SALE",
    type: "",
    address: "",
    latlong: {latitude: 0, longitude: 0},
    dates: {startDates: [], endDates: []},
    details: "",
    website: "",
    creator: undefined,
    id: ""
  }
  const [focusedSale, setfocusedSale] = useState<SaleMapObject>(emptySale);
  const [showSaleDetails, setShowSaleDetails] = useState("-z-10");

  const markerSelected = (marker:SaleMapObject) => {
    // First, zoom to the marker
    const region: Region = {
      latitude: marker.latlong.latitude,
      longitude: marker.latlong.longitude,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };

    mapRef.current?.animateToRegion(region, 500); // Animate over 0.5 seconds
    // Next, show the extra details
    // console.log(marker.title + " SELECTED\nSETTING FOCUSED SALE TO MARKER");
    let temp = marker;
    setfocusedSale(temp);
    setShowSaleDetails("z-10");
    // console.log("FOCUSED SALE TITLE: " + temp.title)
  }

  const markerDeselected = (marker:SaleMapObject) => {
    // console.log(marker.title + " DESELECTED\nSETTING FOCUSED SALE TO EMPTY SALE OBJECT");
    setShowSaleDetails("-z-10");
    let temp = emptySale;
    setfocusedSale(temp);
    // console.log("FOCUSED SALE TITLE: " + temp.title)
  }

  /// Helper Functions ///
  const getLatLong = (async (address:string) => {
    let lat;
    let long;
    try {
      let geocode = await Location.geocodeAsync(address);
      lat = geocode[0].latitude;
      long = geocode[0].longitude;
      // console.log("LATLONG DETERMINED FOR A LOCATION");
    } catch (error) {
      console.error("Geocoding error:", error);
      lat = 32.523205;
      long = -92.637924;
      // console.log("LATLONG COULD NOE BE DETERMINED FOR A LOCATION, DEFAULTING");
    }
    return({lat, long});
  })

  const handlePress = () => {
    // console.log('Create Button pressed!');
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
          startDates: [startDateString],
          endDates: [endDateString]
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
    if(saleType == "") {
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
    if(stateUS == "") {
      reqFilled = false
      valsMissing.push('State');
    }
    if(zipCode == '') {
      reqFilled = false
      valsMissing.push('Zip Code');
    }
    if(startDateString == ''){
      reqFilled = false
      valsMissing.push('Start Date');
    }
    if(endDateString == ''){
      reqFilled = false
      valsMissing.push('End Date');
    }
    if(reqFilled == false){
      let missingStr = "You cannot submit this sale without the following data:\n"
      for(let val of valsMissing){
        missingStr += val + ", "
      }
      let finalStr = missingStr.slice(0, -2); // remove the ", " on the end of the last item.
      Alert.alert("Error: Missing Data", finalStr);
      console.error("Error: Missing Data\n" + finalStr);
    } else if(endDate <= startDate){
      Alert.alert("Error: The end date cannot be before the start date.");
      console.error("Error: The end date cannot be before the start date.");
      return(false);
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
    setStartDate(new Date());
    setEndDate(new Date());
    setStartDateString('');
    setEndDateString('');
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

  // Actual Page
  return (
    <SafeAreaView style={styles.container}>
      {/* MAP CODE*/}
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={isDarkMode ? darkMapStyle : []}
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
            onSelect={() => {markerSelected(marker)}}
            onDeselect={() => {markerDeselected(marker)}}
          />
        ))}
      </MapView>

      {/* Create New Sale Button*/}
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Icon name="plussquare" size={50} color={isDarkMode? "#ddd" : "#081449"} />
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

      {/* Sale Creation Modal */}
      <Modal visible={createSaleModal} animationType='slide' onRequestClose={() => { setCreateSaleModal(false); }}>
        <SafeAreaView className={`${defaultStyle.container}`}>
       
          <TouchableOpacity className={`${defaultStyle.button} bg-red-600 dark:bg-red-600 w-28 h-10`} onPress={ () => { 
            setCreateSaleModal(false)
            resetCreateSale()
          }}>
            <Text className={`${defaultStyle.buttonText} text-center dark:text-white py-2 `}>
              Cancel
            </Text>
          </TouchableOpacity>
          <ScrollView className="w-full p-1" contentContainerStyle={{ flexGrow: 1 }}>
          <KeyboardAvoidingView>
            
              {/* Sale Name */}
              <View className="w-full mb-4">
                <Text className={`${defaultStyle.title} text-center text-2xl text-blue-dark-200`}>
                  List a New Sale
                </Text>
                <Text className={`${defaultStyle.text} mb-2 text-blue-dark-200`}>
                  Sale Name
                </Text>
                <TextInput
                  className={`${nativeWindStyles.textInput}`}
                  placeholder="Enter the name of your sale"
                  placeholderTextColor={isDarkMode ? "#999" : "#b6c2f7"}
                  autoCapitalize="none"
                  keyboardType="default"
                  onChangeText={setSaleName}
                  value={saleName}
                />
              </View>
              {/* Address Stuff */}
              <View className="w-full mb-4">
                <Text className={`${defaultStyle.text} text-center text-xl text-blue-dark-200`}>
                  Address information
                </Text>
                {/* Street Address */}
                <View className="w-full mb-4 flex flex-row">
                  <View className="flex-1 w-1/2 px-1">
                    <Text className={`${defaultStyle.text} text-blue-dark-200`}>
                      Street Address
                    </Text>
                    <TextInput
                      className={`${nativeWindStyles.textInput}`}
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={setStreetAddress}
                      value={streetAddress}
                    />
                  </View>
                  {/* Apt/Suite */}
                  <View className="flex-1 w-1/2 px-1">
                    <Text className={`${defaultStyle.text} text-blue-dark-200`}>
                      Apt/Suite
                    </Text>
                    <TextInput
                      className={`${nativeWindStyles.textInput}`}
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={setSecondaryStreetAddress}
                      value={secondaryStreetAddress}
                    />
                  </View>
                </View>
                <View className="w-full mb-4 flex flex-row">
                  {/* City */}
                  <View className="flex-1 w-1/2 px-1">
                    <Text className={`${defaultStyle.text} text-blue-dark-200`}>
                      City
                    </Text>
                    <TextInput
                      className={`${nativeWindStyles.textInput}`}
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={setCity}
                      value={city}
                    />
                  </View>
                  {/* State */}
                  <View className="flex-1 w-1/2 px-1">
                    <Text className={`${defaultStyle.text} text-blue-dark-200`}>
                      State
                    </Text>
                    <DropDownPicker
                      open={openStateDD}
                      value={stateUS}
                      items={itemsStateDD}
                      setOpen={setOpenStateDD}
                      setValue={setStateUS}
                      setItems={setItemsStateDD}
                      placeholder='Choose your state'
                      style={[
                        styles.dropDown,
                        { backgroundColor: isDarkMode ? "#040a25" : "#fff", borderColor: isDarkMode ? "#6b7280" : "#b6c2f7",  },
                      ]}
                      textStyle={{ color: isDarkMode ? "#fff" : "#889CF2", fontFamily : "Lato-Regular" }}
                      dropDownContainerStyle={{ backgroundColor: isDarkMode ? "#060F37" : "#f8f8f8", borderColor: isDarkMode ? "#6b7280" : "#b6c2f7" }}
                      placeholderStyle={{ color: isDarkMode ? "#ccc" : "#b6c2f7", fontFamily : "Lato-Regular" }}
                    />
                  </View>
                </View>
                {/* Zip Code */}
                <View className="flex-1 w-1/2 px-1">
                  <Text className={`${defaultStyle.text} text-blue-dark-200`}>
                    Zip Code
                  </Text>
                  <TextInput
                    className={`${nativeWindStyles.textInput}`}
                    autoCapitalize="none"
                    keyboardType="default"
                    onChangeText={setZipCode}
                    value={zipCode}
                  />
                </View>
              </View>
              {/* Date Stuff */}
              <Text className={`${defaultStyle.text} text-center text-xl text-blue-dark-200`}>
                Date Information
              </Text>
              <TouchableOpacity className={`${defaultStyle.button} dark:bg-slate-400 h-7 w-3/5 flex-1 justify-center items-center self-center my-2 px-3`} onPress={() => {showStartMode('date')}}>
                <Text className={`${defaultStyle.buttonText} text-blue-dark-200`}>
                  Choose Date
                </Text>
              </TouchableOpacity>
              <View className="w-full mb-4 flex flex-row">
                {/* TODO: Allow users to actually input multiple dates */}
                <View className="flex-1 w-1/2 px-1">
                  <TouchableOpacity className={`${defaultStyle.button} dark:bg-slate-400 h-7 w-full justify-center items-center my-2 px-3`} onPress={() => {showStartMode('time')}}>
                    <Text className={`${defaultStyle.buttonText} text-blue-dark-200`}>
                      Choose Start Time
                    </Text>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      testID="startDateTimePicker"
                      value={startDate}
                      mode={startDateMode}
                      is24Hour={false}
                      onChange={onChangeStartDate}
                    />
                  )}
                  <Text className={`${defaultStyle.text} text-blue-dark-200`}>
                    Start Date and Time: {startDateString}
                  </Text>
                </View>
                {/* End Dates */}
                <View className="flex-1 w-1/2 px-1">
                  <TouchableOpacity className={`${defaultStyle.button} dark:bg-slate-400 h-7 w-full justify-center self-end items-center my-2 px-3`} onPress={() => {showEndMode('time')}}>
                    <Text className={`${defaultStyle.buttonText} text-blue-dark-200`}>
                      Choose End Time
                    </Text>
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      testID="endDateTimePicker"
                      value={endDate}
                      mode={endDateMode}
                      is24Hour={false}
                      onChange={onChangeEndDate}
                    />
                  )}
                  <Text className={`${defaultStyle.text} text-blue-dark-200`}>
                    End Date and Time:         {endDateString}
                    </Text>
                </View>
              </View>
              <View className='py-1'>
                <Text className={`${defaultStyle.text} text-center text-xl text-blue-dark-200`}>
                  Other Information
                </Text>
                {/* Details */}
                <View className='py-2 my-1'>
                  <Text className={`${defaultStyle.text} text-blue-dark-200`}>
                    Details
                  </Text>
                  <TextInput
                    className={`${nativeWindStyles.textInput}`}
                    autoCapitalize="none"
                    keyboardType="default"
                    placeholder="Add any extra details about your sale here"
                    placeholderTextColor={isDarkMode ? "#999" : "#b6c2f7"}
                    onChangeText={setDetails}
                    value={details}
                  />
                </View>
                {/* Sale Type */}
                <View className='my-1'>
                  <Text className={`${defaultStyle.text} text-blue-dark-200`}>
                    Sale Type
                  </Text>
                  <DropDownPicker
                      open={openSaleTypeDD}
                      value={saleType}
                      items={saleTypeDD}
                      setOpen={setOpenSaleTypeDD}
                      setValue={setSaleType}
                      setItems={setSaleTypeDD}
                      placeholder='Choose the type of sale you are listing'
                      style={[
                        styles.dropDown,
                        { backgroundColor: isDarkMode ? "#040a25" : "#fff", borderColor: isDarkMode ? "#6b7280" : "#b6c2f7",  },
                      ]}
                      textStyle={{ color: isDarkMode ? "#fff" : "#889CF2", fontFamily : "Lato-Regular" }}
                      dropDownContainerStyle={{ backgroundColor: isDarkMode ? "#060F37" : "#f8f8f8", borderColor: isDarkMode ? "#6b7280" : "#b6c2f7" }}
                      placeholderStyle={{ color: isDarkMode ? "#ccc" : "#b6c2f7", fontFamily : "Lato-Regular" }}
                    />
                </View>
                {/* Website */}
                <View>
                  <Text className={`${defaultStyle.text} text-blue-dark-200`}>
                    Other places this sale can be found
                  </Text>
                  <TextInput
                    className={`${nativeWindStyles.textInput}`}
                    autoCapitalize="none"
                    keyboardType="default"
                    placeholder="Put other websites your sale is listed on here"
                    placeholderTextColor={isDarkMode ? "#999" : "#b6c2f7"}
                    onChangeText={setWebsite}
                    value={website}
                  />
                </View>
              </View>
              <View className='justify-center items-center w-full'>
                <TouchableOpacity className={`${defaultStyle.button} h-10 justify-center my-2`} onPress={handleSubmit}>
                  <Text className={`${defaultStyle.buttonText} dark:text-blue-dark-200 text-center text-xl py-1`}>
                    List your sale!
                  </Text>
                </TouchableOpacity>
              </View>
          </KeyboardAvoidingView>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* View to display data, hidden by default */}
      <View className={`bg-white dark:bg-blue-dark-200 ${showSaleDetails} w-full h-1/3 absolute bottom-0 left-0 border rounded border-blue-light-100 dark:border-white`}>
        <Text className={`${defaultStyle.title} ${nativeWindStyles.descTitle}`}>{focusedSale.title}</Text>
        {focusedSale.details != '' && <Text className={`${defaultStyle.text} ${nativeWindStyles.descText}`}>Details: {focusedSale.details}</Text>}
        <Text className={`${defaultStyle.text} ${nativeWindStyles.descText}`}>Address: {focusedSale.address}</Text>
        <Text className={`${defaultStyle.text} ${nativeWindStyles.descText}`}>Start Date and Time: {focusedSale.dates.startDates[0]}</Text>
        <Text className={`${defaultStyle.text} ${nativeWindStyles.descText}`}>End Date and Time: {focusedSale.dates.endDates[0]}</Text>
        <Text className={`${defaultStyle.text} ${nativeWindStyles.descText}`}>Sale Type: {focusedSale.type}</Text>
        {focusedSale.website !== '' && <Text className={`${defaultStyle.text} ${nativeWindStyles.descText}`}>Links: {focusedSale.website}</Text>}
      </View>
    </SafeAreaView>
  );
}

// Keep the map styles unmodified for the existing map

const nativeWindStyles = {
  textInput : "border rounded px-3 py-2 border-blue-light-100 dark:border-gray-500 text-blue-light-200 dark:text-white",
  descText : "text-blue-dark-200 text-lg p-0.5",
  descTitle : "text-blue-dark-200 text-3xl py-3"
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
    left: 20,
    padding: 5,
    borderRadius: 5,
    zIndex: 1, // Ensures the create button stays above the map
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  dropDown: {
    borderWidth: 1,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  // Calculator button & modal styling
  calcButtonContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    zIndex: 1,
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

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#263c3f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#38414e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#212a37"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9ca5b3"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1f2835"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f3d19c"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2f3948"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#515c6d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  }
]