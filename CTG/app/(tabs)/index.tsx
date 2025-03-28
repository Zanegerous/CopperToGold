import {
  ActivityIndicator, Animated, Easing, FlatList,
  Keyboard, Modal, StatusBar, Switch, Text,
  TextInput, TouchableOpacity, TouchableWithoutFeedback,
  View, Image, Button
} from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { searchEbay, searchEbayByImage } from "@/ebayApi";
import * as FileConversion from "expo-file-system";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from "../context/ThemeContext";
import { Redirect } from "expo-router";
import WebView from "react-native-webview";
import { useTranslation } from "react-i18next";
import { auth } from "../firebaseconfig/firebase";
import { ref as dbRef, getDatabase, remove, set } from 'firebase/database'
import { onAuthStateChanged, User } from "firebase/auth";
import { useTextScale } from "../context/TextScaleContext";
import { loginWithEbay } from "@/ebayConfig";
import CameraModal from "@/assets/modal/cameraModal";
import SearchSettingsModal from "@/assets/modal/searchSettingsModal";


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
  const [searchWebViewState, setSearchWebViewState] = useState(false);
  const [soldTextLink, setSoldTextLink] = useState(`https://www.ebay.com/sch/i.html?_nkw=${text}&_sacat=0&_from=R40&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1`)

  // User Stuff
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userUID, setUserUID] = useState<string | undefined>(user?.uid);
  const [database, setDatabase] = useState(getDatabase());


  // Animation
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedYPos = useRef(new Animated.Value(300)).current;

  // Camera
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef(null);
  const inputRef = useRef<TextInput>(null);
  const [photoURI, setPhotoUri] = useState(null);

  // Theme
  const { fontScale } = useTextScale();
  const { isDarkMode } = useTheme();  // For accessing dark mode
  const scale = (baseSize: number) => baseSize * fontScale;
  const { t } = useTranslation();



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserUID(user?.uid);
      setDatabase(getDatabase());
      if (user) {
        //console.log("USER IS LOGGED IN: ", user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Hide splash screen once loading is complete
  useEffect(() => {
    if (!loading) SplashScreen.hide();
  }, [loading]);

  if (!permission) {
    return <View />;
  }

  // Gets Camera Permission
  if (!permission.granted) {
    return (
      <View className="flex-1">
        <Text className="bg-black text-white rounded-md text-center text-2xl top-5 w-8/12" style={{ fontSize: scale(24) }}>{t("CameraPermissionAlert")}</Text>
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
      <View className="bg-slate-600 flex-1 border-black rounded-md border-spacing-4 border-2 mb-4 mr-5 ml-5 w-2/5">
        <TouchableOpacity
          onPress={() => { setResultModal(true) }}
          className=""
        >

          {/*This is the outside image*/}
          <Image
            source={{ uri: item.image }}
            className="h-48 m-1 rounded-lg"
            resizeMode='contain'
          />
          <Text className="text-center color-blue-900 font-semibold m-2 rounded-lg bg-zinc-400 text-sm">{item.title}</Text>
          <Text className="text-left text-l ml-1 text-white">{t("PriceListed")}: ${item.price.value}</Text>
          <Text className="text-left ml-1 text-white">{t("ItemConditioning")}: {item.condition}</Text>
        </TouchableOpacity>

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

            <Text className={"text-center font-bold text-3xl bg-blue-dark-100 w-auto m-1 rounded-xl border-black border-2  mb-2 mt-2" + textSettings}>{item.title}</Text>
            <Image
              source={{ uri: item.image }}
              className="w-11/12 h-1/2 m-1 rounded-lg self-center bg-slate-600"
              resizeMode='contain'
            />
            <Text className={"text-left text-3xl ml-4 mt-6" + textSettings}>{t("PriceListing")}: ${item.price.value}</Text>
            <Text className={"text-left text-3xl ml-4" + textSettings}>{t("ItemConditioning")}: {item.condition}</Text>


            <View className="flex-row absolute bottom-2 justify-center content-center w-full">
              <TouchableOpacity onPress={() => setSoldPageModal(true)} className="bg-orange-400 rounded-lg border-2 border-black justify-center w-2/5 self-center h-16" >
                <Text className={"text-center text-2xl justify-center" + textSettings}>{t("HomeSoldOnWebView")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setText(item.title); handleSearch(); setResultModal(false) }} className="bg-orange-400 m-2 rounded-lg border-2 border-black w-1/2 justify-center self-center h-16" >
                <Text className={"text-center text-2xl" + textSettings}>{t("SearchThisItem")}</Text>
              </TouchableOpacity>
            </View>

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
      </View>
    )
  };

  // Formatting for history to be output in history flatlist
  // Render history for search history list
  const renderHistory = ({ item }: { item: string }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setText(item);
        }}
        className="bg-gray-300/70 border-2 rounded-md"
      >
        <Text style={{ fontSize: scale(14), textAlign: "center" }}>{item}</Text>
      </TouchableOpacity>
    );
  };

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
  };

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
  };

  const takePicture = async (camera: { takePictureAsync: () => any } | null) => {
    if (camera != null) {
      const photo = await camera.takePictureAsync();
      setPhotoUri(photo.uri);
      setCameraOpen(false);
      searchImageResults(photo.uri);
    }
  };

  // logic to handle searching from the text
  const handleSearch = () => {
    // alert(text);
    if (text === '' || text === null) {
      alert("Must Enter Search");
    } else {
      handleHistory();
      searchTextResults();
      setSoldTextLink(`https://www.ebay.com/sch/i.html?_nkw=${text}&_sacat=0&_from=R40&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1`)
      handleSearchClose();
    }
  };

  const dualSearchMerge = (textResults: any[]) => {
    const textListingIds = new Set(textResults.map(item => item.id))
    const matching = imageSearchResults.filter(item => textListingIds.has(item.id))
    setMatchingItems(matching);
  };

  const handleHistory = () => {
    const cleanHistor = history.filter(item => item != text);
    setHistory([text, ...cleanHistor.slice(0, 9)]);
  };

  // Animation for opening search bar
  const handleSearchOpen = () => {
    setIsExpanded(true);

    Animated.parallel([
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
    ]).start(() => {
      setSubmitVisible(true);
      setHistoryVisible(true);
      if (inputRef.current != null) {
        inputRef.current.focus();
      }
    });
  };

  // Animation for closing search bar
  const handleSearchClose = () => {
    setSubmitVisible(false);
    setHistoryVisible(false);
    Keyboard.dismiss();
    Animated.parallel([
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
    ]).start(() => {
      setIsExpanded(false);
    });
  };


  // Home Page
  if (!loading && user) {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (text === "") {
            handleSearchClose(); // close input if text is empty and user clicks outside
          }
        }}
      >
        <SafeAreaView className={styles.BackgroundView.join(" ")}>
          <StatusBar barStyle={"light-content"} className="bg-zinc-900" />

          {/* Settings Gear */}
          <TouchableOpacity
            onPress={() => {
              setSettingModal(true);
            }}
            className="left-1/3 ml-20 mt-2"
            style={{ zIndex: 10 }}
          >
            <Icon name="gear" size={50} color="darkgrey" />
          </TouchableOpacity>

          {/* Title */}
          <View className="flex-row items-center justify-center top-24 absolute">
            <Text
              className={styles.TitleText.join(" ") + " text-orange-600"}
            >
              C
            </Text>
            <Text
              className={styles.TitleText.join(" ") + " text-white"}
            >
              2
            </Text>
            <Text
              className={styles.TitleText.join(" ") + " text-yellow-300"}
            >
              G
            </Text>
          </View>

          <View className="top-1/4">
            {/* Search Screen */}
            {isExpanded ? (
              <View className="w-3/4 self-center">
                <View className="flex-row items-center justify-between">
                  <Animated.View
                    style={{ width: animatedWidth, top: animatedYPos }}
                  >
                    <TextInput
                      placeholder= {t("SearchEnterBox")}
                      value={text}
                      onChangeText={setText}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      autoFocus={true}
                      onSubmitEditing={() => {
                        handleSearch();
                      }}
                      className={`w-full self-center border-2 rounded-2xl h-14 ${searchFocused
                        ? "border-blue-500 bg-blue-200"
                        : "border-black bg-gray-400"
                        }`}
                      ref={inputRef}
                      style={{ fontSize: scale(16) }}
                    />
                    {/* History list */}
                    {historyVisible && history.length >= 1 ? (
                      <View className="bg-slate-800 border-2 rounded-lg mt-1 h-32">
                        <FlatList
                          data={history}
                          renderItem={renderHistory}
                          keyExtractor={(item: any, index: any) =>
                            `${item}-${index}`
                          }
                          numColumns={1}
                        />
                      </View>
                    ) : (
                      <View />
                    )}
                  </Animated.View>
                  {submitVisible ? (
                    <TouchableOpacity
                      onPress={() => {
                        handleSearch();
                      }}
                      className="absolute top-3 right-3"
                    >
                      <Icon name="search" size={20} color="blue" />
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )}
                </View>
              </View>
            ) : (
              <View>
                {/* Default Screen */}
                <TouchableOpacity
                  className="bg-white h-16 w-56 justify-center items-center mt-8 rounded-lg"
                  onPress={handleSearchOpen}
                >
                  <Text style={{ fontSize: scale(16) }} className="text-gray-600">
                    {t("HomeSearchBox")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white h-16 w-56 justify-center items-center mt-8 rounded-lg"
                  onPress={() => {
                    setCameraOpen(true);
                  }}
                >
                  <Text style={{ fontSize: scale(16) }} className="text-gray-600">
                    {t("CameraBox")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Camera Element. Cant disable shutter audio unfortunetly. may look into switching to react-native-vision-camera*/}
          <CameraModal
            cameraOpen={cameraOpen}
            setCameraOpen={setCameraOpen}
            takePicture={takePicture}
            searchBarcodeResult={searchBarcodeResult}
            setText={setText}
            setLoadingSymbolState={setLoadingSymbolState}
            handleSearchOpen={handleSearchOpen}
          />

          {/* Settings Screen */}
          <SearchSettingsModal
            settingModal={settingModal} // Pass the visibility state
            setSettingModal={setSettingModal} // Pass the setter function to close the modal
            auctionSetting={auctionSetting} // Pass auction setting state
            toggleAuctionSetting={toggleAuctionSetting} // Pass auction toggle function
            usedItemSetting={usedItemSetting} // Pass used item setting state
            toggleUsedItemSetting={toggleUsedItemSetting} // Pass used item toggle function
          />

          {/* Search View Modal, cant move due to complexity*/}
          <Modal visible={searchResultModal} onRequestClose={() => { setSearchResultModal(false) }}>
            <SafeAreaView className="h-full w-full bg-blue-dark absolute">
              <View className="flex-row">
                {/*Back Button that refreshes all states*/}
                <TouchableOpacity className=" self-left px-1 mt-4 ml-2  "
                  onPress={() => {
                    setSearchResultModal(false);
                    setText('');
                    setIsImageSearchActive(false);
                    setPhotoUri(null);
                    setImageSearchResults([]);
                    setMatchingItems(null);
                  }}>
                  <Icon name={'arrow-circle-o-left'} color={'orange'} size={50} />
                </TouchableOpacity>

                <Text className="self-center text-white font-bold text-2xl  ">
                  {"\t"}{t("AveragePrice")}: ${getAvgPrice(matchingItems ? matchingItems : searchResults)} {"\n"}
                  {"\t"}{t("FoundItems")}: {(matchingItems ? matchingItems : searchResults)?.length}
                </Text>

              </View>

              <View className=" w-5/6 self-center relative mt-0 flex-row">
                <TextInput
                  placeholder={t("SearchEnterBox")}
                  value={text}
                  onChangeText={setText}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  autoFocus={true}
                  onSubmitEditing={() => { handleSearch(); }}
                  className={`w-full self-center border-2 rounded-2xl h-14 ${searchFocused ? 'border-blue-500 bg-blue-200' : 'border-black bg-gray-400'}`}
                  ref={inputRef}
                  style={{ fontSize: scale(16) }}
                />

                <TouchableOpacity onPress={() => { handleSearch(); }} className="absolute right-16 top-3 z-12">
                  <Icon name="search" size={25} color='blue' />
                </TouchableOpacity>

                {photoURI ? (
                  <TouchableOpacity
                    className="absolute right-1 top-1"
                    onPress={() => {
                      setPhotoUri(null);
                      setSearchResultModal(false);
                      setMatchingItems(null);
                      setCameraOpen(true);
                    }}
                  >
                    {photoURI && (
                      <Image
                        source={{ uri: photoURI }}
                        className="w-12 h-12 rounded-xl z-10"
                      />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity className="absolute right-1 top-1" onPress={() => {
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
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    contentContainerStyle={{ padding: 25 }}
                  />
                ) : (
                  <View className="bg-white text-2xl w-10/12 self-center">
                    <Text style={{ fontSize: scale(24), textAlign: "center" }}>
                      {t("SearchItemsFound")}
                    </Text>
                  </View>
                )}
              </View>

              <View className="absolute bottom-0 w-full bg-blue-dark py-4 z-20 border-black border-t-2">
                <TouchableOpacity
                  onPress={() => {
                    setSearchWebViewState(true);
                  }}
                  className="self-center bg-orange-400 py-2 px-8 rounded-xl">
                  <Text className="text-white text-xl">{t("HomeSoldOnWebView")}</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Modal>

          {/* Web View Modal*/}
          <Modal visible={searchWebViewState} onRequestClose={() => { setSearchWebViewState(false) }}>
            <View className="flex-1">
              <View className="bg-blue-dark-100">
                <TouchableOpacity className=" self-left px-1 mt-2 mb-2 ml-2  "
                  onPress={() => {
                    setSearchWebViewState(false)
                  }}>
                  <Icon name={'arrow-circle-o-left'} color={'orange'} size={50} />
                </TouchableOpacity>
              </View>

              <WebView
                source={{ uri: soldTextLink }}
                scalesPageToFit={true}
              />
            </View>
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
  }

  /*
  * While loading, display that the page is loading
  * This should always be behind the splash screen, but I'm leaving it here anyways just to be safe */
  if (loading) {
    return (
      <SafeAreaView>
        <Text style={{ fontSize: scale(16) }}>Loading...</Text>
      </SafeAreaView>
    );
  }
}

const styles = {
  BackgroundView: [
    "flex-1",
    "bg-blue-dark-100",
    "w-screen",
    "h-screen",
    "items-center",
  ],
  TitleText: ["text-9xl", "font-bold", "font-serif"],
  SearchButton: [],
  ButtonText: [],
};
