import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Text, Image, View, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../../global.css";
import LISTINGS from "../../../constants/exampleListings.js";
import LISTING_PICS from "../../../constants/examplePics.js"

export default function Listing() {
  const {id} = useLocalSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const listingInfo = LISTINGS[id - 1];

  return (
    <SafeAreaView className="bg-slate-700 size-full">
      <Image className={styles.image} source={LISTING_PICS[listingInfo.imgId]} resizeMode="contain" />
      <View className={styles.seperator}/>
      <Text className={styles.title}>{listingInfo.title}</Text>
      <Text className={styles.text}>•Price: ${listingInfo.price}</Text>
      <Text className={styles.text}>•Condition: {listingInfo.cond}</Text>
      <Text className={styles.text}>•Quantity Sold: {listingInfo.quantitySold}</Text>
      <Text className={styles.text}>•Upload Date: {listingInfo.uploadDate}</Text>
      <TouchableOpacity onPress={() => setIsModalOpen(true)} className={styles.openButton}>
        <Text className="text-white text-center text-2xl">More Details</Text>
      </TouchableOpacity>
      <Modal visible={isModalOpen} transparent={true}>
        <SafeAreaView className="flex-auto bg-black/[0.5]">
          <View className={styles.modal}>
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
  listingView: 'my-6 mx-3',
  image: "size-[380px] mt-[30px] mx-auto rounded-xl",
  seperator : "bg-white h-1 w-[95%] rounded-md mx-auto my-5",
  title: "text-center text-3xl mx-1 mb-2 text-white font-bold",
  text: "text-3xl m-50 text-white",
  openButton: "bg-slate-800 rounded-2xl mx-auto my-5 p-5 w-3/4 justify-center",
  modal: "flex-auto mx-auto mt-[450px] mb-[150px] bg-slate-300 rounded-[20] px-30 py-100 items-center elevation-[5]",
  modalText: "text-2xl p-5 font-light text-center",
  closeButton: "w-3/4 bg-slate-100 py-4 mt-3 rounded-xl self-center"
}