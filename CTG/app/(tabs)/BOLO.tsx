import React, { useState, useEffect } from "react";
import {SafeAreaView,View,Text,Image,StyleSheet,ActivityIndicator,Modal,TouchableOpacity,Alert,TextInput,} from "react-native";
import DeckSwiper from "react-native-deck-swiper";
import { useTranslation } from "react-i18next";
import { searchEbay } from "@/ebayApi";
import Icon from "react-native-vector-icons/FontAwesome";
import { WebView } from "react-native-webview";

import BoloPageModal from "@/assets/modal/BoloPageModal";
import BoloHistoryModal from "@/assets/modal/BoloHistoryModal";

import { auth } from "../firebaseconfig/firebase";
import { getDatabase, ref, push, onValue, remove } from "firebase/database";

export interface EbayItem {
  id: string;
  title: string;
  price: { value: string; currency: string } | string;
  condition: string;
  image: string;
  listingUrl?: string;
  timestamp?: number;
}

export default function Bolo() {
  const [cardIndex, setCardIndex] = useState(0);
  const [items, setItems] = useState<EbayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const [settingModal, setSettingModal] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [listingModalVisible, setListingModalVisible] = useState(false);
  const [listingUrl, setListingUrl] = useState("");

  const [savedItems, setSavedItems] = useState<EbayItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { label: "Technology", value: "technology" },
    { label: "Utensils", value: "utensils" },
    { label: "Vintage", value: "vintage" },
    { label: "Antiques", value: "antiques" },
    { label: "Collectibles", value: "collectibles" },
  ];

  const fetchData = (manualQuery?: string) => {
    setLoading(true);
    setCardIndex(0);

    const categoryQueries: Record<string, string[]> = {
      technology: ["vintage camera", "smartphone", "laptop", "headphones"],
      utensils: ["silverware", "ceramic plates", "cutlery set", "cooking utensils"],
      vintage: ["retro radio", "classic watch", "old records", "vintage clothing"],
      antiques: ["antique vase", "antique furniture", "antique clock"],
      collectibles: ["coins", "stamps", "sports memorabilia", "trading cards"],
    };
    const defaultQueries = ["vintage camera", "retro radio", "classic watch"];
    const queries = selectedCategory ? categoryQueries[selectedCategory] : defaultQueries;
    const queryText = manualQuery || queries[Math.floor(Math.random() * queries.length)];

    searchEbay(queryText)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("eBay fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const db = getDatabase();
    const histRef = ref(db, `users/${user.uid}/history`);

    const unsubscribe = onValue(histRef, (snapshot) => {
      const arr: EbayItem[] = [];
      snapshot.forEach((child) => {
        const val = child.val() as Omit<EbayItem, "id">;
        arr.push({ id: child.key as string, ...val });
      });
      arr.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setSavedItems(arr);
    });

    return () => unsubscribe();
  }, []);

  const handleSwipeRight = (item: EbayItem) => {
    const user = auth.currentUser;
    if (!user) return console.warn("Not logged in");

    const db = getDatabase();
    const histRef = ref(db, `users/${user.uid}/history`);

    const data = {
      title: item.title,
      price: item.price,
      condition: item.condition ?? "",
      image: item.image,
      listingUrl,
      timestamp: Date.now(),
    };

    push(histRef, data).catch((err) => console.error("RTDB write error:", err));
  };

  const handleDelete = (item: EbayItem) => {
    const user = auth.currentUser;
    if (!user) return console.warn("Not logged in");

    const db = getDatabase();
    const itemRef = ref(db, `users/${user.uid}/history/${item.id}`);
    remove(itemRef).catch((err) => console.error("RTDB delete error:", err));

    setSavedItems((curr) => curr.filter((i) => i.id !== item.id));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, width: "100%" }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.header}>{t("")}</Text>
          <TouchableOpacity onPress={() => setSettingModal(true)}>
            <Icon name="gear" size={30} color="darkgrey" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search for items..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => fetchData(searchQuery)}
          returnKeyType="search"
          blurOnSubmit={true}
        />

        {/* DeckSwiper */}
        <DeckSwiper
          cards={items}
          cardIndex={cardIndex}
          onSwiped={(i) => setCardIndex(i + 1)}
          onSwipedRight={(i) =>
            Alert.alert(
              "Confirm",
              "Add this item to history?",
              [
                { text: "No", onPress: () => setCardIndex(i), style: "cancel" },
                {
                  text: "Yes",
                  onPress: () => {
                    handleSwipeRight(items[i]);
                    setCardIndex(i + 1);
                  },
                },
              ],
              { cancelable: false }
            )
          }
          renderCard={(item) =>
            item && (
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.detail}>
                  Price: {typeof item.price === "object" ? item.price.value : item.price}
                </Text>
                <Text style={styles.detail}>Condition: {item.condition}</Text>
                <TouchableOpacity
                  style={styles.viewListingButton}
                  onPress={() => {
                    const encoded = encodeURIComponent(item.title);
                    setListingUrl(
                      `https://www.ebay.com/sch/i.html?_nkw=${encoded}&_sacat=0&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1`
                    );
                    setListingModalVisible(true);
                  }}
                >
                  <Text style={styles.viewListingButtonText}>View Listing</Text>
                </TouchableOpacity>
              </View>
            )
          }
          backgroundColor="transparent"
          stackSize={3}
        />

        {/* History Button */}
        <TouchableOpacity style={styles.historyButton} onPress={() => setHistoryModalVisible(true)}>
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <BoloPageModal
        settingModal={settingModal}
        setSettingModal={setSettingModal}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setSettingModal(false);
        }}
        categories={categories}
      />

      {/* History Modal */}
      <BoloHistoryModal
        historyModal={historyModalVisible}
        setHistoryModal={setHistoryModalVisible}
        savedItems={savedItems}
        onItemPress={(item) => {
          if (item.listingUrl) {
            setListingUrl(item.listingUrl);
            setListingModalVisible(true);
            setHistoryModalVisible(false);
          }
        }}
        onItemDelete={handleDelete}
      />

      {/* Listing Modal */}
      <Modal
        visible={listingModalVisible}
        animationType="slide"
        onRequestClose={() => setListingModalVisible(false)}
      >
        <SafeAreaView style={styles.webviewContainer}>
          <TouchableOpacity
            onPress={() => setListingModalVisible(false)}
            style={styles.closeModalButton}
          >
            <Icon name="arrow-circle-o-left" size={30} color="#fff" />
          </TouchableOpacity>
          <WebView source={{ uri: listingUrl }} style={styles.webview} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  searchInput: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    marginBottom: 10,
    width: "100%",
    bottom: 14
  },
  card: {
    width: 320,
    height: 420,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    marginVertical: 10,
    alignSelf: "center",
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
    textAlign: "center",
  },
  detail: {
    fontSize: 16,
    marginVertical: 2,
    textAlign: "center",
  },
  viewListingButton: {
    backgroundColor: "#ff8500",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  viewListingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  historyButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "#444",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 9999,
  },
  historyButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeModalButton: {
    padding: 10,
    alignSelf: "flex-start",
  },
  webview: {
    flex: 1,
  },
});
