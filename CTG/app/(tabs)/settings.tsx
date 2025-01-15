import React from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebaseconfig/firebase";
import { useRouter } from "expo-router";

export default function Settings() {
  const { isDarkMode, toggleDarkMode } = useTheme();
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
