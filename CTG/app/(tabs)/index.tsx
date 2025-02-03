import { Animated, Easing, Keyboard, StatusBar, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useAnimatedValue, View } from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'


// https://reactnative.dev/docs/animated

export default function Index() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitVisible, setSubmitVisible] = useState(false);
  const [text, setText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedYPos = useRef(new Animated.Value(300)).current;
  const inputRef = useRef<TextInput>(null);

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
      if (inputRef.current != null) {
        inputRef.current.focus();
      }
    });
  }

  const handleSearchClose = () => {
    setSubmitVisible(false)
    Keyboard.dismiss;

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
      setText('');
    });
  }

  return (
    <TouchableWithoutFeedback onPress={() => { handleSearchClose(); }}>
      <SafeAreaView className={styles.BackgroundView.join(' ')} >
        <StatusBar barStyle={'light-content'} className='bg-zinc-900' />
        <View className="flex-row items-center justify-center top-16">
          <Text className={styles.TitleText.join(' ') + " text-orange-600"}>C</Text>
          <Text className={styles.TitleText.join(' ') + " text-white"}>2</Text>
          <Text className={styles.TitleText.join(' ') + " text-yellow-300"}>G</Text>
        </View>

        <View className="top-1/4">
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
                    onSubmitEditing={() => { /* add search function; */ handleSearchClose(); }}
                    className={`w-full self-center border-2 rounded-2xl h-12 ${searchFocused ? 'border-blue-500 bg-blue-200' : 'border-black bg-gray-400'}`}
                    ref={inputRef}
                  />
                </Animated.View>
                {submitVisible ? (<TouchableOpacity onPress={() => { handleSearchClose(); }} className="absolute top-3 right-3">
                  <Icon name="search" size={20} color='blue' />
                </TouchableOpacity>
                ) : (<View />)}
              </View>
            </View>

          ) : (

            <TouchableOpacity
              className="bg-white h-16 w-56 justify-center items-center mt-8  rounded-lg"
              onPress={handleSearchOpen}
            >
              <Text className="text-gray-600">Search</Text>
            </TouchableOpacity>

          )}
        </View>

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
    'items-center'
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
