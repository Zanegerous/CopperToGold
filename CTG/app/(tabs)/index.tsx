import {ActivityIndicator,Animated,Easing,FlatList,Keyboard,Modal,StatusBar,Switch,Text,TextInput,TouchableOpacity,TouchableWithoutFeedback,View,Image,Button,StyleSheet} from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { searchEbay, searchEbayByImage } from "@/ebayApi";
import * as FileConversion from "expo-file-system";
import { CameraView, useCameraPermissions } from "expo-camera";
import { onAuthStateChanged, User } from "firebase/auth";
import * as SplashScreen from "expo-splash-screen";
import { auth } from "../firebaseconfig/firebase";
import { useTheme } from "../context/ThemeContext";
import { Redirect } from "expo-router";
import { useTextScale } from "../context/TextScaleContext";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { fontScale } = useTextScale();
  const { isDarkMode } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [auctionSetting, toggleAuctionSetting] = useState(false);
  const [usedSetting, toggleUsedSetting] = useState(false);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedYPos = useRef(new Animated.Value(300)).current;
  const inputRef = useRef<TextInput>(null);
  const cameraRef = useRef(null);
  const [photoURI, setPhotoUri] = useState(null);
  const [text, setText] = useState("");

  // Modals
  const [settingModal, setSettingModal] = useState(false);
  const [soldModal, setSoldModal] = useState(false);
  const [soldPageLink, setSoldPageLink] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isTextSearchActive, setIsTextSearchActive] = useState(false);
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResultModal, setSearchResultModal] = useState(false);
  const [searchResults, setSearchResults] = useState<EbayItem[] | null>(null);
  const [textSearchResults, setTextSearchResults] = useState<EbayItem[]>([]);
  const [imageSearchResults, setImageSearchResults] = useState<EbayItem[]>([]);
  const [matchingItems, setMatchingItems] = useState<EbayItem[] | null>(null);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true); // Helps with race condition

  // Helper to scale font sizes
  const scale = (baseSize: number) => baseSize * fontScale;

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        console.log("USER IS LOGGED IN: ", user);
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

  if (!permission.granted) {
    return (
      <View style={{ flex: 1 }}>
        <Text
          className="bg-black text-white rounded-md text-center text-2xl top-5 w-8/12"
          style={{ fontSize: scale(24) }}
        >
          {t("CameraPermissionAlert")}
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

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

  // Render each search result item
  const renderResultItem = ({ item }: { item: EbayItem }) => (
    <TouchableOpacity
      onPress={() => {
        alert(item.title);
      }}
      className="bg-gray-500 border-black rounded-md border-spacing-4 border-2 mb-4 mr-5 ml-5 w-40"
    >
      <Image
        source={{ uri: item.image }}
        className="w-36 h-36 m-1 rounded-lg"
      />
      <Text
        style={{ fontSize: scale(14), textAlign: "center", fontWeight: "bold" }}
        className="text-center color-blue-900"
      >
        {item.title}
      </Text>
      <Text style={{ fontSize: scale(14), textAlign: "center" }}>
        {item.price.currency} {item.price.value}
      </Text>
      <Text style={{ fontSize: scale(14), textAlign: "center" }}>
        {item.condition}
      </Text>
    </TouchableOpacity>
  );

  const dualSearchMerge = () => {
    const textListingIds = new Set(textSearchResults.map((item) => item.id));
    const matching = imageSearchResults.filter((item) =>
      textListingIds.has(item.id)
    );
    setMatchingItems(matching);
    console.log(matching);
  };

  const convertImageToBase64 = async (imageUri: string) => {
    const base64 = await FileConversion.readAsStringAsync(imageUri, {
      encoding: FileConversion.EncodingType.Base64,
    });
    return base64;
  };

  const searchBarcodeResult = (barcode: string) => {
    setCameraOpen(false);
    setText(barcode);
    alert("Text has been set to: " + text);
  };

  const takePicture = async (camera: { takePictureAsync: () => any } | null) => {
    if (camera != null) {
      const photo = await camera.takePictureAsync();
      setPhotoUri(photo.uri);
      setCameraOpen(false);
      searchImageResults(photo.uri);
    } else {
      alert("Null Camera");
    }
  };

  const searchImageResults = async (imageUri: string) => {
    const base64Image = await convertImageToBase64(imageUri);
    setIsLoading(true);
    await searchEbayByImage(base64Image)
      .then((results) => {
        setImageSearchResults(results);
        setSearchResults(results);
        setIsImageSearchActive(true);
        setIsTextSearchActive(false);
        setSearchResultModal(true);
      })
      .catch((error) => {
        console.error("Error searching eBay with image:", error);
      })
      .finally(() => {
        setIsLoading(false);
        setSearchResultModal(true);
      });
  };

  const searchTextResults = async () => {
    setIsLoading(true);
    if (text !== "") {
      await searchEbay(text)
        .then((results) => {
          console.log("Found items: ", results.length);
          setTextSearchResults(results);
          setSearchResults(results);
          setIsTextSearchActive(true);
          setSearchResultModal(true);
        })
        .catch((error) => {
          console.log("Error Searching eBay with text:", error);
        })
        .finally(() => {
          if (isImageSearchActive === true) {
            dualSearchMerge();
          }
          setIsLoading(false);
          setSearchResultModal(true);
        });

      Keyboard.dismiss();
      {/*reminder to come back and look at this I have an idea */}
    } else {
      alert("Must Enter Search");
    }
  };

  const searchSold = () => {
    if (text === "") {
      alert("Must Enter Search");
    } else {
      setSoldModal(true);
      setSoldPageLink(
        `https://www.ebay.com/sch/i.html?_nkw=${text}&_sacat=0&_from=R40&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1`
      );
    }
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

  // Update search history
  const handleHistory = () => {
    const cleanHistory = history.filter((item) => item !== text);
    setHistory([text, ...cleanHistory.slice(0, 9)]);
  };

  // Handle search from text
  const handleSearch = () => {
    if (text === "" || text === null) {
      {/*remind me to come back and edit this */}
      alert("Must Enter Search");
    } else {
      handleHistory();
      searchTextResults();
      handleSearchClose();
    }

    if (isImageSearchActive) {
      dualSearchMerge();
    }
  };

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
          <View className="flex-row items-center justify-center top-16 absolute">
            <Text
              className={styles.TitleText.join(" ") + " text-orange-600"}
              style={{ fontSize: scale(72) }}
            >
              C
            </Text>
            <Text
              className={styles.TitleText.join(" ") + " text-white"}
              style={{ fontSize: scale(72) }}
            >
              2
            </Text>
            <Text
              className={styles.TitleText.join(" ") + " text-yellow-300"}
              style={{ fontSize: scale(72) }}
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
                      className={`w-full self-center border-2 rounded-2xl h-12 ${
                        searchFocused
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

          {/* Camera Modal */}
          <Modal visible={cameraOpen}>
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing={"back"}
              mode="picture"
              mute={true}
              animateShutter={false}
              barcodeScannerSettings={{
                barcodeTypes: ["ean13","ean8","upc_a","upc_e","code128","code39","itf14",],
              }}
              onBarcodeScanned={({ data }) => searchBarcodeResult(data)}
            >
              {/* Close Camera Button */}
              <TouchableOpacity
                className="bg-blue-300 rounded-lg w-1/4 h-10 justify-center self-left px-1 absolute top-4 left-2"
                onPress={() => setCameraOpen(false)}
              >
                <Text
                  style={{ fontSize: scale(12) }}
                  className="text-blue-600 text-center"
                >
                  {t("CloseCameraButton")}
                </Text>
              </TouchableOpacity>

              {/* Take Picture Button */}
              <TouchableOpacity
                onPress={() => takePicture(cameraRef.current)}
                className="rounded-full border-8 border-white absolute bottom-20 w-24 h-24 self-center"
              />
            </CameraView>
          </Modal>

          {/* Settings Modal */}
          <Modal visible={settingModal} transparent={true} animationType={"fade"} className="flex-1">
            <View className="flex-1 justify-center align-middle items-center bg-black/50">
              <View className="w-96 h-96 bg-slate-600 border-4 rounded-2xl">
                <TouchableOpacity onPress={() => setSettingModal(false)} className="w-12">
                  <Icon name="times-circle" size={40} color="red" className="m-1" />
                </TouchableOpacity>
                <Text
                  className="align-middle text-center font-semibold text-4xl text-white"
                  style={{ fontSize: scale(32) }}
                >
                  {t("HomeSearchSettings")}
                </Text>
                <View className="w-36 h-12 bg-white flex-row items-center justify-between p-2 mt-6 rounded-lg self-center border-2">
                  <Text style={{ fontSize: scale(16) }} className="text-m">
                    {t("HomeAuctionToggle")}
                  </Text>
                  <Switch
                    value={auctionSetting}
                    onValueChange={toggleAuctionSetting}
                    trackColor={{ true: "#767577", false: "#81b0ff" }}
                    thumbColor={"#f5dd4b"}
                  />
                </View>
                <View className="w-36 h-12 bg-white flex-row items-center justify-between p-2 mt-4 rounded-lg self-center border-2">
                  {usedSetting ? (
                    <Text style={{ fontSize: scale(18) }} className="text-lg">
                      {t("HomeUsedToggle")}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: scale(18) }} className="text-lg">
                      {t("HomeNewToggle")}
                    </Text>
                  )}
                  <Switch
                    value={usedSetting}
                    onValueChange={toggleUsedSetting}
                    trackColor={{ true: "#767577", false: "#81b0ff" }}
                    thumbColor={"#f5dd4b"}
                  />
                </View>
              </View>
            </View>
          </Modal>

          {/* Search Results Modal */}
          <Modal visible={searchResultModal}>
            <SafeAreaView className="flex-1 bg-blue-dark">
              <TouchableOpacity
                className="self-left px-1 mt-4 ml-2"
                onPress={() => {
                  setSearchResultModal(false);
                  setText("");
                  setIsImageSearchActive(false);
                  setIsTextSearchActive(false);
                  setPhotoUri(null);
                  setImageSearchResults([]);
                  setTextSearchResults([]);
                  setMatchingItems(null);
                }}
              >
                <Icon name={"arrow-circle-o-left"} color={"orange"} size={50} />
              </TouchableOpacity>

              <View className="w-5/6 self-center relative mt-0 flex-row">
                <TextInput
                  placeholder="Enter Here"
                  value={text}
                  onChangeText={setText}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  autoFocus={false}
                  onSubmitEditing={() => {
                    handleSearch();
                  }}
                  className={`w-5/6 self-center border-2 rounded-2xl h-12 ${
                    searchFocused
                      ? "border-blue-500 bg-blue-200"
                      : "border-black bg-gray-400"
                  }`}
                  ref={inputRef}
                  style={{ fontSize: scale(16) }}
                />

                <TouchableOpacity
                  onPress={() => {
                    handleSearch();
                  }}
                  className="absolute right-20 top-2 z-12"
                >
                  <Icon name="search" size={25} color="blue" />
                </TouchableOpacity>

                {photoURI ? (
                  <TouchableOpacity
                    className="absolute right-1"
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
                  <TouchableOpacity
                    className="absolute right-1"
                    onPress={() => {
                      setPhotoUri(null);
                      setSearchResultModal(false);
                      setMatchingItems(null);
                      setCameraOpen(true);
                    }}
                  >
                    <Icon
                      name="camera"
                      size={40}
                      color={"orange"}
                      className="w-12 h-12 rounded-xl z-10"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View className="border-t-4 mt-2 rounded-m bg-blue-dark-200">
                {(searchResults || matchingItems) ? (
                  <FlatList
                    data={matchingItems ? matchingItems : searchResults}
                    renderItem={renderResultItem}
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
            </SafeAreaView>
          </Modal>

          {isLoading && (
            <View className="absolute top-0 left-0 right-0 bottom-0 justify-center align-middle bg-black/50">
              <ActivityIndicator size="large" color="white" />
            </View>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }

  // Redirect to login page if user isn't logged in and everything is loaded
  if (!loading && !user) {
    console.log("USER IS NULL, AND THUS NOT LOGGED IN");
    return <Redirect href="/Pages/LoginPage" />;
  }

  // While loading, display a loading view
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
