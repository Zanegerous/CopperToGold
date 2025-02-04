import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebaseconfig/firebase";
import { useRouter } from "expo-router";

export default function Settings() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Firebase logout function
  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert("Logged out", "You have been logged out successfully.");
      router.replace("/Pages/LoginPage");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "An error occurred while logging out. Please try again.");
    }
  };

  // Firebase delete account function
  const handleDelete = async () => {
    try {
      const user = auth.currentUser;
      if (user == null) {
        throw new Error("User does not exist, User: " + user)
      }
      await user.delete();
      Alert.alert("Account deleted", "Your account has been deleted successfully.");
      router.replace("/Pages/LoginPage");
    } catch (error) {
      console.error("Account deletion error:", error);
      Alert.alert("Error", "An error occurred while deleting your account. Please try again.");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#000" : "#fff" },
      ]}
    >
      {/* Top title */}
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>
        Welcome to the settings page
      </Text>

      {/* Switch row */}
      <View style={styles.switchContainer}>
        <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
          Dark Mode
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ true: "#767577", false: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          { backgroundColor: "#f00" },
        ]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutText, { color: isDarkMode ? "#fff" : "#fff" }]}>
          Logout
        </Text>
      </TouchableOpacity>

      {/* Delete Account */}
      {/* Button that opens warning modal */}
      <TouchableOpacity style={[ styles.logoutButton, { backgroundColor: "#f00" }, ]} onPress={() => setIsModalOpen(true)}>
        <Text style={[styles.logoutText, { color: isDarkMode ? "#fff" : "#fff" }]}>Delete Account</Text>
      </TouchableOpacity>
      {/* Inside of modal have warning msg and del account button */}
      <Modal visible={isModalOpen} transparent={true}>
        <SafeAreaView className="flex-auto bg-black/[0.5]">
          <View className="flex-auto mx-auto mt-[450px] mb-[150px] bg-white rounded-[20] px-30 py-100 items-center elevation-[5]">
            {/* Warning Text */}
            <Text className="text-center text-2xl">Warning: This will permanently delete your account.</Text>
            <Text className="text-center font-bold text-[#f00] text-2xl">THIS ACTION CAN NOT BE UNDONE.</Text>
            {/* Delete button */}
            <TouchableOpacity
              style={[
                styles.logoutButton,
                { backgroundColor: "#f00" },
              ]}
              onPress={handleDelete}
            >
              <Text style={[styles.logoutText, { color: isDarkMode ? "#fff" : "#fff" }]}> Delete Account </Text>
            </TouchableOpacity>
            {/* Cancel button (just closes modal) */}
            <TouchableOpacity style={[ styles.logoutButton, { backgroundColor: isDarkMode ? "#fff" : "#000" }, ]} onPress={() => setIsModalOpen(false)}>
              <Text className="text-center font-light text-2xl text-white">Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 12, // space below the title
  },
  switchContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoutButton: {
    marginTop: 32,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
