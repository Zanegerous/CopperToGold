import {
  ActivityIndicator, Animated, Easing, FlatList,
  Keyboard, Modal, StatusBar, Switch, Text,
  TextInput, TouchableOpacity, TouchableWithoutFeedback,
  View, Image, Button
} from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'
import { searchEbay, searchEbayByImage } from "@/ebayApi";
import * as FileConversion from 'expo-file-system'
import { CameraView, useCameraPermissions } from "expo-camera";
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from "../context/ThemeContext";
import { Redirect } from "expo-router";
import WebView from "react-native-webview";

import { FIREBASE_STORAGE, auth } from "../firebaseconfig/firebase";
import { Database, ref as dbRef, getDatabase, push, remove, set } from 'firebase/database'
import { onAuthStateChanged, User } from "firebase/auth";
import { ref } from 'firebase/storage'



interface EbayItem {
  title: string;
  price: { value: string; currency: string };
  image: string;
  condition: string;
  id: string;
}

// Keep the splash screen visible while we fetch the auth status
SplashScreen.preventAutoHideAsync();

export default function Index() {
  // Permissions
  const [permission, requestPermission] = useCameraPermissions();

  // User Interface
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [searchResultModal, setSearchResultModal] = useState(false);

  // Input Manager
  const [text, setText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);

  // Settings
  const [auctionSetting, toggleAuctionSetting] = useState(false);
  const [usedItemSetting, toggleUsedItemSetting] = useState(false);
  const [settingModal, setSettingModal] = useState(false);

  // Search Manager
  const [loadingSymbolState, setLoadingSymbolState] = useState(false);
  const [searchResults, setSearchResults] = useState<EbayItem[] | null>(null);
  const [imageSearchResults, setImageSearchResults] = useState<EbayItem[]>([]);
  const [matchingItems, setMatchingItems] = useState<EbayItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  // User Stuff
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userUID, setUserUID] = useState<string | undefined>(user?.uid);
  const [database, setDatabase] = useState<Database>(getDatabase());


  // Animation
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedYPos = useRef(new Animated.Value(300)).current;

  // Camera
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef(null);
  const inputRef = useRef<TextInput>(null);
  const [photoURI, setPhotoUri] = useState(null);

  // Theme
  const { isDarkMode } = useTheme();  // For accessing dark mode


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserUID(user?.uid);
      setDatabase(getDatabase());
      if (user) {
        console.log("USER IS LOGGED IN: ", user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // when the page is done loading hide the splash screen
  useEffect(() => {
    if (!loading) SplashScreen.hide()
  }, [loading])
  if (!permission) {
    return <View />;
  }

  // Gets Camera Permission
  if (!permission.granted) {
    return (
      <View className="flex-1">
        <Text className="bg-black text-white rounded-md text-center text-2xl top-5 w-8/12">We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // Saving to firebase Logic
  const saveItem = async (item: EbayItem) => {
    const cleanTitle = item.title.replace(/[^a-zA-Z0-9]/g, "_");
    const saveRef = `users/${userUID}/savedItems/${cleanTitle}`
    const itemRef = dbRef(database, saveRef);


    try {
      await set(itemRef, {
        title: item.title,
        price: item.price,
        image: item.image,
        condition: item.condition,
        id: item.id
      });
      console.log('saved Item: ', item.title)
    } catch (error: any) {
      console.error("Save Error: ", error);
    } finally {

    }

  }

  // removing from firebase logic
  const deleteSavedItem = async (item: EbayItem) => {
    const cleanTitle = item.title.replace(/[^a-zA-Z0-9]/g, "_");
    const saveRef = dbRef(database, `users/${userUID}/savedItems/${cleanTitle}`);
    try {

      await remove(saveRef);
      console.log('Removed Item: ', item.title)
    } catch (error: any) {
      console.error("Delete Error: ", error);
    } finally {

    }

  }



  // React Component that holds a modal with item information.
  const RenderResultItem = ({ item }: { item: EbayItem }) => {
    const [resultModal, setResultModal] = useState(false);
    const soldPageLink = `https://www.ebay.com/sch/i.html?_nkw=${item.title}&_sacat=0&_from=R40&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1`
    const [saveState, setSaveState] = useState(false);
    const [soldPageModal, setSoldPageModal] = useState(false);
    const textSettings = ' color-white'; // space needed at start

    return (
      <TouchableOpacity
        onPress={() => { setResultModal(true) }}
        className="bg-gray-500 border-black rounded-md border-spacing-4 border-2 mb-4 mr-5 ml-5 w-40"
      >

        {/*This is the outside image*/}
        <Image
          source={{ uri: item.image }}
          className="w-36 h-36 m-1 rounded-lg"
          resizeMode='contain'
        />
        <Text className="text-center color-blue-900 font-bold text-sm">{item.title}</Text>
        <Text className="text-center">{item.price.currency} {item.price.value}</Text>
        <Text className="text-center">{item.condition}</Text>

        {/* Zoom up modal */}
        <Modal visible={resultModal} onRequestClose={() => { setResultModal(false) }} animationType='fade'>
          <View className="bg-blue-dark-200 flex-1">
            <View className="flex-row justify-between items-center">

              <TouchableOpacity className=" px-1 mt-4 ml-2  "
                onPress={() => {
                  setResultModal(false)
                }}>
                <Icon name={'arrow-circle-o-left'} color={'orange'} size={50} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {
                if (saveState == false) {
                  saveItem(item);
                  setSaveState(true);
                } else {
                  deleteSavedItem(item);
                  setSaveState(false);
                }
              }}
                className="mt-4 mr-2 "
              >
                <Icon name={'star'} size={50} color={saveState ? 'yellow' : 'grey'} />
              </TouchableOpacity>

            </View>

            <Text className={"text-center font-bold text-3xl bg-blue-dark-100 rounded-xl border-black border-2 m-4" + textSettings}>{item.title}</Text>

            <Image
              source={{ uri: item.image }}
              className="w-11/12 h-1/2 m-1 rounded-lg self-center"
              resizeMode='contain'
            />

            <Text className={"text-center" + textSettings}>{item.price.currency} {item.price.value}</Text>
            <Text className={"text-center" + textSettings}>{item.condition}</Text>

            <TouchableOpacity onPress={() => setSoldPageModal(true)} className="bg-orange-400 rounded-lg border-2 border-black w-1/2 self-center h-16" >
              <Text className={"text-center" + textSettings}>See Sold Items</Text>
            </TouchableOpacity>

            <View className="w-full h-2/3 self-center p-5">
              <Modal visible={soldPageModal} animationType='slide' onRequestClose={() => { setSoldPageModal(false) }}>
                <View className="bg-blue-dark-100">
                  <TouchableOpacity className=" self-left px-1 mt-2 mb-2 ml-2  "
                    onPress={() => {
                      setSoldPageModal(false)
                    }}>
                    <Icon name={'arrow-circle-o-left'} color={'orange'} size={50} />
                  </TouchableOpacity>
                </View>
                <WebView
                  source={{ uri: soldPageLink }}
                  scalesPageToFit={true}
                />
              </Modal>
            </View>

          </View>

        </Modal>


      </TouchableOpacity>
    )
  };

  // Formatting for history to be output in history flatlist
  const renderHistory = ({ item }: { item: string }) => {
    return (
      <TouchableOpacity onPress={() => { setText(item) }} className="bg-gray-300/70 border-2 rounded-md">
        <Text className="text-center">{item}</Text>
      </TouchableOpacity>
    );
  }


  const getAvgPrice = (list: EbayItem[] | null): number => {
    if (list == null || list.length == 0) {
      return 0;
    } else {
      const total = list.reduce((sum, item) => sum + parseFloat(item.price.value), 0);
      const avg = total / list.length
      return parseFloat(avg.toFixed(2));
    }
  };

  const convertImageToBase64 = async (imageUri: string) => {
    const base64 = await FileConversion.readAsStringAsync(imageUri, {
      encoding: FileConversion.EncodingType.Base64,
    });
    return base64;
  };

  const searchBarcodeResult = (barcode: string) => {
    setCameraOpen(false)
    setText(barcode)
    // alert('Text has been set to: ' + text)
  }

  const searchImageResults = async (imageUri: string) => {
    const base64Image = await convertImageToBase64(imageUri);
    setLoadingSymbolState(true)
    await searchEbayByImage(base64Image).then((results) => {
      setImageSearchResults(results);
      setSearchResults(results);
      setIsImageSearchActive(true)
    }).catch((error) => {
      console.error("Error searching eBay with image:", error)
    }).finally(() => {
      setLoadingSymbolState(false);
      setSearchResultModal(true);
    })
  };

  const searchTextResults = async () => {
    setLoadingSymbolState(true)
    if (text != '') {
      await searchEbay(text).then((results) => {
        setSearchResults(results);

        if (isImageSearchActive) {
          dualSearchMerge(results);
        }
      }).catch((error) => {
        console.log('Error Searching eBay with text:', error);
      }).finally(() => {
        setLoadingSymbolState(false);
        setSearchResultModal(true);
      })
      Keyboard.dismiss();
    } else {
      alert('Must Enter Search')
    }
  }

  const takePicture = async (camera: { takePictureAsync: () => any; } | null) => {
    if (camera != null) {
      const photo = await camera.takePictureAsync();
      setPhotoUri(photo.uri)
      setCameraOpen(false);
      searchImageResults(photo.uri);
    }
  }

  // logic to handle searching from the text
  const handleSearch = () => {
    if (text === '' || text === null) {
      alert("Must Enter Search");
    } else {
      handleHistory();
      searchTextResults();
      handleSearchClose();
    }
  }

  const dualSearchMerge = (textResults: any[]) => {
    const textListingIds = new Set(textResults.map(item => item.id))
    const matching = imageSearchResults.filter(item => textListingIds.has(item.id))
    setMatchingItems(matching);
  }

  const handleHistory = () => {
    const cleanHistor = history.filter(item => item != text);
    setHistory([text, ...cleanHistor.slice(0, 9)]);
  }

  // Animation for opening search bar
  const handleSearchOpen = () => {
    setIsExpanded(true);

    Animated.parallel([ // runs both Animations
      Animated.timing(animatedWidth, {
        toValue: 300,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: false,
      }),

      Animated.timing(animatedYPos, {
        toValue: 0,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
    ]).start(() => { // runs after animation finishes
      setSubmitVisible(true);
      setHistoryVisible(true);
      if (inputRef.current != null) {
        inputRef.current.focus();
      }
    });
  }

  // Animation for clsoing search bar
  const handleSearchClose = () => {
    setSubmitVisible(false)
    setHistoryVisible(false);

    Keyboard.dismiss;

    Animated.parallel([ // Runs both animations
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }),

      Animated.timing(animatedYPos, {
        toValue: 100,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
    ]).start(() => { // Runs after animation finishes
      setIsExpanded(false);
    });
  }


  // Home Page
  if (!loading && user) {
    return (
      <TouchableWithoutFeedback onPress={() => { if (text == '') { handleSearchClose(); /* if text is empty and user clicks outside input, close input*/ } }}>
        <SafeAreaView className={styles.BackgroundView.join(' ') /* formats in stylesheet below example */} >
          <StatusBar barStyle={'light-content'} className='bg-zinc-900' />

          <TouchableOpacity onPress={() => { setSettingModal(true); }} className="left-1/3 ml-20 mt-2" style={{ zIndex: 10 }}>
            <Icon name='gear' size={50} color='darkgrey' className="" />
          </TouchableOpacity>

          {/* Title */}
          <View className="flex-row items-center justify-center top-16 absolute">
            <Text className={styles.TitleText.join(' ') + " text-orange-600"}>C</Text>
            <Text className={styles.TitleText.join(' ') + " text-white"}>2</Text>
            <Text className={styles.TitleText.join(' ') + " text-yellow-300"}>G</Text>
          </View>

          <View className="top-1/4">
            {/* Search Screen */}
            {isExpanded ? (
              <View className="w-3/4 self-center">
                <View className="flex-row items-center justify-between">
                  <Animated.View style={{ width: animatedWidth, top: animatedYPos }}>
                    <TextInput
                      placeholder="Enter Here"
                      value={text} onChangeText={setText}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      autoFocus={true}
                      onSubmitEditing={() => { handleSearch(); }}
                      className={`w-full self-center border-2 rounded-2xl h-12 ${searchFocused ? 'border-blue-500 bg-blue-200' : 'border-black bg-gray-400'}`}
                      ref={inputRef}
                    />
                    {/*If a history exists and input is open*/}
                    {historyVisible && (history.length >= 1) ? (
                      <View className="bg-slate-800 border-2 rounded-lg mt-1 h-32">
                        <FlatList
                          data={history}
                          renderItem={renderHistory}
                          keyExtractor={(item: any, index: any) => `${item}-${index}`}
                          numColumns={1}
                        />
                      </View>
                    ) : (
                      <View />
                    )}
                  </Animated.View>
                  {submitVisible ? (
                    <TouchableOpacity onPress={() => { handleSearch(); }} className="absolute top-3 right-3">
                      <Icon name="search" size={20} color='blue' />
                    </TouchableOpacity>
                  ) : (<View />)}
                </View>
              </View>
            ) : (
              <View>
                {/* Default Screen */}
                <TouchableOpacity
                  className="bg-white h-16 w-56 justify-center items-center mt-8  rounded-lg"
                  onPress={handleSearchOpen}
                >
                  <Text className="text-gray-600">Search</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white h-16 w-56 justify-center items-center mt-8  rounded-lg"
                  onPress={() => { setCameraOpen(true) }}
                >
                  <Text className="text-gray-600">Open Camera</Text>
                </TouchableOpacity>

              </View>
            )}
          </View>

          {/* Camera Element. Cant disable shutter audio unfortunetly. may look into switching to react-native-vision-camera*/}
          <Modal visible={cameraOpen} onRequestClose={() => { setCameraOpen(false) }}>
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing={'back'}
              mode="picture"
              mute={true}
              animateShutter={false}
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "itf14"]
              }}
              onBarcodeScanned={({ data }) => searchBarcodeResult(data)}
            >
              {/*Button to close camera*/}
              <TouchableOpacity className="bg-blue-300 rounded-lg w-1/4 h-10 justify-center self-left px-1 absolute top-4 left-2" onPress={() => setCameraOpen(false)}>
                <Text className="text-blue-600 text-center text-l">Close Camera</Text>
              </TouchableOpacity>

              {/* Button to take picture */}
              <TouchableOpacity onPress={() => takePicture(cameraRef.current)} className=" rounded-full border-8 border-white absolute bottom-20 w-24 h-24 self-center ">

              </TouchableOpacity>
            </CameraView>
          </Modal>

          {/* Settings Screen */}
          <Modal visible={settingModal} transparent={true} animationType={'fade'} className="flex-1 " onRequestClose={() => { setSettingModal(false) }}>
            <View className="flex-1 justify-center align-middle items-center bg-black/50">
              <View className="w-96 h-96 bg-slate-600 border-4 rounded-2xl ">

                <TouchableOpacity onPress={() => setSettingModal(false)} className="w-12">
                  <Icon name='times-circle' size={40} color='red' className="m-1" />
                </TouchableOpacity>

                <Text className="align-middle text-center font-semibold text-4xl text-white ">Search Settings</Text>

                <View className="w-36 h-12 bg-white flex-row items-center justify-between p-2 mt-6 rounded-lg self-center border-2">
                  <Text className="text-m">Auctions</Text>
                  <Switch
                    value={auctionSetting}
                    onValueChange={toggleAuctionSetting}
                    trackColor={{ true: "#767577", false: "#81b0ff" }}
                    thumbColor={"#f5dd4b"}
                  />
                </View>

                <View className="w-36 h-12 bg-white flex-row items-center justify-between p-2  mt-4 rounded-lg self-center border-2">
                  {usedItemSetting ? (<Text className="text-lg">Used</Text>) : (<Text className="text-lg">New</Text>)}
                  <Switch
                    value={usedItemSetting}
                    onValueChange={toggleUsedItemSetting}
                    trackColor={{ true: "#767577", false: "#81b0ff" }}
                    thumbColor={"#f5dd4b"}
                  />
                </View>
              </View>
            </View>
          </Modal>

          {/* Search View Modal */}
          <Modal visible={searchResultModal} onRequestClose={() => { setSearchResultModal(false) }}>
            <SafeAreaView className="flex-1 bg-blue-dark">
              <View className="flex-row">
                {/*Back Button that refreshes all states*/}
                <TouchableOpacity className=" self-left px-1 mt-4 ml-2  "
                  onPress={() => {
                    setSearchResultModal(false);
                    setText('');
                    setIsImageSearchActive(false);
                    setPhotoUri(null);
                    setImageSearchResults([]);
                    setMatchingItems(null)
                  }}>
                  <Icon name={'arrow-circle-o-left'} color={'orange'} size={50} />
                </TouchableOpacity>

                <Text className="self-center text-white font-bold text-2xl  ">
                  {"\t"}Avg Price: ${getAvgPrice(matchingItems ? matchingItems : searchResults)} {"\n"}
                  {"\t"}Item's Found: {(matchingItems ? matchingItems : searchResults)?.length}
                </Text>

              </View>

              <View className=" w-5/6 self-center relative mt-0 flex-row">
                <TextInput
                  placeholder="Enter Here"
                  value={text} onChangeText={setText}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  autoFocus={true}
                  onSubmitEditing={() => { handleSearch(); }}
                  className={`w-full self-center border-2 rounded-2xl h-12 ${searchFocused ? 'border-blue-500 bg-blue-200' : 'border-black bg-gray-400'}`}
                  ref={inputRef}
                />

                <TouchableOpacity onPress={() => { handleSearch(); }} className="absolute right-16 top-2 z-12">
                  <Icon name="search" size={25} color='blue' />
                </TouchableOpacity>

                {photoURI ? (
                  <TouchableOpacity className="absolute right-1" onPress={() => {
                    setPhotoUri(null);
                    setSearchResultModal(false);
                    setMatchingItems(null);
                    setCameraOpen(true);
                  }}>
                    {photoURI && <Image source={{ uri: photoURI }} className=" w-12 h-12 rounded-xl z-10" />}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity className="absolute right-1" onPress={() => {
                    setPhotoUri(null);
                    setSearchResultModal(false);
                    setMatchingItems(null);
                    setCameraOpen(true);
                  }}>
                    {<Icon name='camera' size={35} color={'orange'} className=" w-12 h-12 rounded-xl z-10 mt-1" />}
                  </TouchableOpacity>
                )}
              </View>


              <View className="border-t-4 mt-2 rounded-m bg-blue-dark-200">
                {(searchResults || matchingItems) ? (
                  <FlatList
                    data={matchingItems ? matchingItems : searchResults}
                    renderItem={({ item }) => <RenderResultItem item={item} />}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    contentContainerStyle={{ padding: 25 }}
                  />
                ) : (
                  <View className="bg-white text-2xl w-10/12 self-center">
                    <Text className="text-3xl text-center">No Items Found</Text>
                  </View>
                )}

              </View>

            </SafeAreaView>
          </Modal>

          {/* Converted to a modal for better useage and to overlay ontop of other modals */}
          <Modal visible={loadingSymbolState} transparent={true} animationType="fade">
            <View className="absolute top-0 left-0 right-0 bottom-0 justify-center align-middle bg-black/50 z-auto">
              <ActivityIndicator size='large' color="white" />
            </View>
          </Modal>

        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }

  // Redirect to login page if user isn't logged in and everything is loaded
  if (!loading && !user) {
    console.log("USER IS NULL, AND THUS NOT LOGGED IN");
    return <Redirect href="/Pages/LoginPage" />;
  };

  /*
  * While loading, display that the page is loading
  * This should always be behind the splash screen, but I'm leaving it here anyways just to be safe */
  if (loading) {
    return (
      <SafeAreaView>
        <Text>
          Loading...
        </Text>
      </SafeAreaView>
    )
  }
}

const styles = {
  BackgroundView: [
    'flex-1',
    'bg-blue-dark-100',
    'w-screen',
    'h-screen',
    'items-center',
  ],
  TitleText: [
    'text-9xl',
    'font-bold',
    'font-serif'
  ],
  SearchButton: [

  ],
  ButtonText: [

  ]

}
