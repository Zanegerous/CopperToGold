import React, { useState } from "react";
import {View,Text,Switch,StyleSheet,TouchableOpacity,Alert, Platform,} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useTextScale } from "../context/TextScaleContext";
import { auth } from "../firebaseconfig/firebase";
import { useRouter } from "expo-router";

// If you want a type for the dropdown items:
type FontScaleOption = {
  label: string;
  value: number;
};

const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { fontScale, setFontScale } = useTextScale();
  const router = useRouter();

  // State for DropDownPicker
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<number>(fontScale);
  const [items, setItems] = useState<FontScaleOption[]>([
    { label: "Small", value: 0.8 },
    { label: "Normal", value: 1 },
    { label: "Large", value: 1.2 },
    { label: "X-Large", value: 1.5 },
  ]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert("Logged out", "You have been logged out successfully.");
      router.replace("/Pages/LoginPage");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(
        "Error",
        "An error occurred while logging out. Please try again."
      );
    }
  };

  // When an item is selected in the dropdown, update both local state and global text scale
  const handleSetValue = (selectedValue: any) => {
    setValue(selectedValue);
    setFontScale(selectedValue);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#000" : "#fff" },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
            >
              
        <Text style={styles.backButtonText}>{"<"} Back</Text>
      </TouchableOpacity>
      {/* Title */}
      <Text
        style={[
          styles.title,
          { color: isDarkMode ? "#fff" : "#000", fontSize: 18 * fontScale },
        ]}
      >
        Welcome to the settings page
      </Text>

      {/* Dark Mode Switch */}
      <View style={styles.switchContainer}>
        <Text
          style={{
            color: isDarkMode ? "#fff" : "#000",
            fontSize: 16 * fontScale,
          }}
        >
          Dark Mode
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ true: "#767577", false: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* Text Scaling Dropdown */}
      <View style={styles.pickerContainer}>
        <Text
          style={{
            color: isDarkMode ? "#fff" : "#000",
            fontSize: 16 * fontScale,
            marginBottom: 8,
          }}
        >
          Text Size
        </Text>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={handleSetValue}
          setItems={setItems}
          // Style the dropdown itself
          style={[
            styles.dropDown,
            {
              backgroundColor: isDarkMode ? "#333" : "#f4f4f4",
              borderColor: isDarkMode ? "#555" : "#ccc",
            },
          ]}
          // Text inside the dropdown button
          textStyle={{
            color: isDarkMode ? "#fff" : "#000",
            fontSize: 16 * fontScale,
          }}
          // The open dropdown list container
          dropDownContainerStyle={{
            backgroundColor: isDarkMode ? "#333" : "#f4f4f4",
            borderColor: isDarkMode ? "#555" : "#ccc",
          }}
          placeholderStyle={{
            color: isDarkMode ? "#ccc" : "#888",
          }}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: "#f00" }]}
        onPress={handleLogout}
      >
        <Text
          style={[
            styles.logoutText,
            { color: "#fff", fontSize: 16 * fontScale },
          ]}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    top: 15
  },
  switchContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerContainer: {
    marginTop: 16,
    width: "100%",
  },
  dropDown: {
    borderWidth: 1,
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

  backButton: {
    position: "absolute",
    top: 20,
    left: 10,
    backgroundColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: "#000",
  },
});
