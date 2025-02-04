import { Animated, Easing, FlatList, Keyboard, Modal, StatusBar, Switch, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'


// https://reactnative.dev/docs/animated
// 

export default function Index() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [text, setText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [settingModal, setSettingModal] = useState(false);
  const [auctionSetting, toggleAuctionSetting] = useState(false);
  const [usedSetting, toggleUsedSetting] = useState(false);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedYPos = useRef(new Animated.Value(300)).current;
  const inputRef = useRef<TextInput>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);

  // Formatting for history to be output in history flatlist
  const renderHistory = ({ item }: { item: string }) => {
    return (
      <TouchableOpacity onPress={() => { setText(item) }} className="bg-gray-300/70 border-2 rounded-md">
        <Text className="text-center">{item}</Text>
      </TouchableOpacity>
    );
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
      setText('');
    });
  }

  // cleans and sets up history
  const handleHistory = () => {
    const cleanHistor = history.filter(item => item != text);
    setHistory([text, ...cleanHistor.slice(0, 9)]);
  }

  // logic to handle searching from the text
  const handleSearch = () => {
    if (text === '') {
      alert("Must Enter Search");
    } else {
      handleHistory();
      handleSearchClose();
    }
  }

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
                {submitVisible ? (<TouchableOpacity onPress={() => { handleSearch(); }} className="absolute top-3 right-3">
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
                onPress={() => { alert('camera') }}
              >
                <Text className="text-gray-600">Open Camera</Text>
              </TouchableOpacity>

            </View>
          )}
        </View>

        {/* Settings Screen */}
        <Modal visible={settingModal} transparent={true} animationType={'fade'} className="flex-1 ">
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
                {usedSetting ? (<Text className="text-lg">Used</Text>) : (<Text className="text-lg">New</Text>)}
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

      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = {
  BackgroundView: [
    'flex-1',
    'bg-navy-100',
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
