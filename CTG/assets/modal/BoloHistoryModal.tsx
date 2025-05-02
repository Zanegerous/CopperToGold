import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { EbayItem } from "../../app/(tabs)/BOLO";

interface BoloHistoryModalProps {
  historyModal: boolean;
  setHistoryModal: (v: boolean) => void;
  savedItems: EbayItem[];
  onItemPress: (item: EbayItem) => void;
  onItemDelete: (item: EbayItem) => void;
}

export default function BoloHistoryModal({
  historyModal,
  setHistoryModal,
  savedItems,
  onItemPress,
  onItemDelete,
}: BoloHistoryModalProps) {
  return (
    <Modal visible={historyModal} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setHistoryModal(false)} style={styles.close}>
            <Icon name="times-circle" size={30} color="red" />
          </TouchableOpacity>

          <Text style={styles.title}>Your History</Text>

          {savedItems.length === 0 ? (
            <Text style={styles.empty}>No saved items yet.</Text>
          ) : (
            <ScrollView style={styles.list}>
              {savedItems.map((item) => (
                <View key={item.id} style={styles.row}>
                  <TouchableOpacity style={styles.rowContent} onPress={() => onItemPress(item)}>
                    <Image source={{ uri: item.image }} style={styles.thumb} />
                    <View style={styles.info}>
                      <Text numberOfLines={1} style={styles.itemTitle}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {typeof item.price === "object" ? item.price.value : item.price}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => onItemDelete(item)}>
                    <Icon name="trash" size={20} color="#900" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:  { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  container: { width: 320, height: 400, backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  close:     { position: "absolute", top: 8, right: 8 },
  title:     { fontSize: 20, fontWeight: "600", textAlign: "center", marginBottom: 12 },
  empty:     { textAlign: "center", marginTop: 40, color: "#666" },
  list:      { marginTop: 8 },
  row:       { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  rowContent:{ flexDirection: "row", alignItems: "center", flex: 1 },
  thumb:     { width: 50, height: 50, borderRadius: 4 },
  info:      { marginLeft: 12, flex: 1 },
  itemTitle:{ fontSize: 14, fontWeight: "500" },
  itemPrice:{ fontSize: 12, color: "#888" },
  deleteBtn:{ padding: 8 },
});
