import React, { useState } from "react";
import { SafeAreaView, View, Text, Image, StyleSheet } from "react-native";
import DeckSwiper from "react-native-deck-swiper";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import images from "../../assets/images/BoloImages";



// Example placeholder items (replace these with real eBay data when ready)
const placeholderItems = [
  {
    id: "1",
    title: "Vintage Camera",
    price: "$12.99",
    condition: "Used",
    image: images.Camera,
  },
  {
    id: "2",
    title: "Retro Video Game",
    price: "$24.99",
    condition: "Used",
    image: images.Retro,
  },
  {
    id: "3",
    title: "Designer Shoes",
    price: "$45.00",
    condition: "Pre-owned",
    image: images.Shoes,
  },
  {
    id: "4",
    title: "Collectible Figurine",
    price: "$19.50",
    condition: "New",
    image: images.Figurine,
  },
  {
    id: "5",
    title: "Smartphone",
    price: "$199.99",
    condition: "Refurbished",
    image: images.Smartphone,
  },
];

export default function Bolo() {
  const [cardIndex, setCardIndex] = useState(0);

  // Called whenever a user swipes left
  const onSwipedLeft = (index: number) => {
    console.log("Swiped left on:", placeholderItems[index].title);
  };

  // Called whenever a user swipes right
  const onSwipedRight = (index: number) => {
    console.log("Swiped right on:", placeholderItems[index].title);
  };

  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{t("BoloItems")}</Text>

      <DeckSwiper
        cards={placeholderItems}
        cardIndex={cardIndex}
        onSwipedLeft={onSwipedLeft}
        onSwipedRight={onSwipedRight}
        onSwiped={(index) => setCardIndex(index + 1)}
        renderCard={(item) => {
          if (!item) return null;
          return (
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.detail}>Price: {item.price}</Text>
              <Text style={styles.detail}>Condition: {item.condition}</Text>
            </View>
          );
        }}
        backgroundColor={"transparent"}
        stackSize={3}
      />

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  card: {
    width: 320,
    height: 420,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detail: {
    fontSize: 16,
    marginVertical: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
