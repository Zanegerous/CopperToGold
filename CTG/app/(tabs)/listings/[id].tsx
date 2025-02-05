import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Text, Image, View, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../../global.css";
import defaultStyles from '../../styles/defaultStyle';  // Import the default styles
import { useTheme } from "../../context/ThemeContext";
import { useColorScheme } from "nativewind";
import LISTINGS from "../../../constants/exampleListings.js";
import LISTING_PICS from "../../../constants/examplePics.js"

export default function Listing() {
  const { isDarkMode } = useTheme(); // This is for accessing darkmode from ThemeContext
  const { colorScheme, setColorScheme } = useColorScheme();
  setColorScheme(isDarkMode ? "dark" : "light");

  const { id }: any = useLocalSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const listingInfo = LISTINGS[id - 1];

  return (
    <SafeAreaView className="bg-white dark:bg-blue-dark size-full">
      <Image className={styles.image} source={LISTING_PICS[listingInfo.imgId]} resizeMode="contain" />
      <View className={styles.seperator} />
      <Text className={`${defaultStyles.title} ${styles.title}`}> {listingInfo.title} </Text>
      <Text className={styles.text}> •Condition: {listingInfo.cond} </Text>
      <Text className={styles.text}> •Price: ${listingInfo.price} </Text>
      <Text className={styles.text}> •Quantity Sold: {listingInfo.quantitySold} </Text>
      <Text className={styles.text}> •Upload Date: {listingInfo.uploadDate} </Text>
      <TouchableOpacity onPress={() => setIsModalOpen(true)} className={styles.openButton}>
        <Text className="text-center text-2xl font-lato-regular">More Details</Text>
      </TouchableOpacity>
      <Modal visible={isModalOpen} transparent={true}>
        <SafeAreaView className="flex-auto bg-white/[0.5]">
          <View className={"flex-auto mx-auto my-80 bg-[#060e37] rounded-[20] px-30 py-100 items-center elevation-[5]"}>
            <Text className={styles.modalText}>Location: {listingInfo.location}</Text>
            <Text className={styles.modalText}>eBay Item #{listingInfo.eBayId}</Text>
            <TouchableOpacity onPress={() => setIsModalOpen(false)} className={styles.closeButton}>
              <Text className="text-center font-light text-2xl">Close Details</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = {
  image: "size-[380px] mt-[30px] mx-auto rounded-xl",
  seperator: "bg-white h-1 w-[95%] rounded-md mx-auto my-5",
  title: "text-center text-3xl mx-1 mb-2 text-white font-lato-bold",
  text: "text-3xl m-50 text-white font-lato-regular",
  openButton: "bg-[#f98824] rounded-2xl mx-auto my-5 p-5 w-3/4 justify-center",
  modal: "flex-auto mx-auto mt-[450px] mb-[150px] bg-[#060e37] rounded-[20] px-30 py-100 items-center elevation-[5]",
  modalText: "text-2xl p-5 font-light text-center text-white",
  closeButton: "w-3/4 bg-[#f98824] py-4 mt-3 rounded-xl self-center"
}