import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity, // Using react-native's TouchableOpacity
} from "react-native";
import DeckSwiper from "react-native-deck-swiper";
import { useTranslation } from "react-i18next";
import { searchEbay } from "@/ebayApi";
import Icon from "react-native-vector-icons/FontAwesome";
import { WebView } from "react-native-webview";
import BoloPageModal from "@/assets/modal/BoloPageModal";
import BoloHistoryModal from "@/assets/modal/BoloHistoryModal";

interface EbayItem {
  id: string;
  title: string;
  price: { value: string; currency: string } | string;
  condition: string;
  image: string;
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

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { label: "Technology", value: "technology" },
    { label: "Utensils", value: "utensils" },
    { label: "Vintage", value: "vintage" },
    { label: "Antiques", value: "antiques" },
    { label: "Collectibles", value: "collectibles" },
  ];

  const fetchData = () => {
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
    const query = queries[Math.floor(Math.random() * queries.length)];

    console.log(
      `Fetching eBay data with query '${query}' from category '${
        selectedCategory || "default"
      }'.`
    );

    searchEbay(query)
      .then((data: EbayItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching eBay data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  // Debug the visibility state of history modal.
  useEffect(() => {
    console.log("History modal visible:", historyModalVisible);
  }, [historyModalVisible]);

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
        <View style={styles.headerRow}>
          <Text style={styles.header}>{t("")}</Text>
          <TouchableOpacity onPress={() => setSettingModal(true)} style={{ zIndex: 10 }}>
            <Icon name="gear" size={50} color="darkgrey" />
          </TouchableOpacity>
        </View>

        <DeckSwiper
          cards={items}
          cardIndex={cardIndex}
          onSwiped={(index) => setCardIndex(index + 1)}
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
                    const encodedTitle = encodeURIComponent(item.title);
                    setListingUrl(
                      `https://www.ebay.com/sch/i.html?_nkw=${encodedTitle}&_sacat=0&_from=R40&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1`
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

        {/* History Button (ALWAYS ON TOP) */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => {
            console.log("History button clicked");
            setHistoryModalVisible(true);
          }}
        >
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <BoloPageModal
        settingModal={settingModal}
        setSettingModal={setSettingModal}
        selectedCategory={selectedCategory}
        setSelectedCategory={(category) => {
          setSelectedCategory(category);
          setSettingModal(false);
        }}
        categories={categories}
      />

      {/* History Modal */}
      <BoloHistoryModal
        historyModal={historyModalVisible}
        setHistoryModal={setHistoryModalVisible}
      />

      {/* WebView Modal */}
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
    justifyContent: "center",
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
    marginBottom: 5,
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

export default Bolo;
