import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert, Modal } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useTextScale } from "../context/TextScaleContext";
import { auth } from "../firebaseconfig/firebase";
import { useRouter } from "expo-router";
import { useNotifSetting } from "../context/NotificationContext";

type FontScaleOption = {
  label: string;
  value: number;
};

type LanguageOption = {
  label: string;
  value: string;
};

const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isNotif, toggleNotifications } = useNotifSetting();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fontScale, setFontScale } = useTextScale();
  const router = useRouter();

  // Text scale picker state
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(fontScale);
  const [items, setItems] = useState<FontScaleOption[]>([
    { label: "Small", value: 0.8 },
    { label: "Normal", value: 1 },
    { label: "Large", value: 1.2 },
    { label: "X-Large", value: 1.5 },
  ]);

  // Language picker state
  const [langOpen, setLangOpen] = useState(false);
  const [langValue, setLangValue] = useState("en");
  const [langItems, setLangItems] = useState<LanguageOption[]>([
    { label: "English", value: "en" },
    { label: "Español", value: "es" },
  ]);

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

  // When a new font scale is selected
  const handleSetValue = (selectedValue: number) => {
    setValue(selectedValue);
    setFontScale(selectedValue);
  };

  // Placeholder language setter (does nothing else yet)
  const handleSetLanguage = (selectedLang: string) => {
    setLangValue(selectedLang);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#000" : "#fff" },
      ]}
    >
      {/* Back Button 
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>{"<"} Back</Text>
      </TouchableOpacity>
      */}

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

      {/*Notification toggle*/}
      <View style={styles.switchContainer}>
        <Text
          style={{
            color: isDarkMode ? "#fff" : "#000",
            fontSize: 16 * fontScale,
          }}
        >
          Turn off notifications
        </Text>
        <Switch
          value={isNotif}
          onValueChange={toggleNotifications}
          trackColor={{ true: "#767577", false: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* Text Size Picker */}
      <View style={[styles.pickerContainer, { marginBottom: 35 }]}>
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
          style={[
            styles.dropDown,
            {
              backgroundColor: isDarkMode ? "#333" : "#f4f4f4",
              borderColor: isDarkMode ? "#555" : "#ccc",
            },
          ]}
          textStyle={{
            color: isDarkMode ? "#fff" : "#000",
            fontSize: 16 * fontScale,
          }}
          dropDownContainerStyle={{
            backgroundColor: isDarkMode ? "#333" : "#f4f4f4",
            borderColor: isDarkMode ? "#555" : "#ccc",
          }}
          placeholderStyle={{
            color: isDarkMode ? "#ccc" : "#888",
          }}

        />
      </View>

      {/* Language Picker */}
      <View style={styles.pickerContainer}>
        <Text
          style={{
            color: isDarkMode ? "#fff" : "#000",
            fontSize: 16 * fontScale,
            marginBottom: 8,
            marginTop: 16,
          }}
        >
          Language
        </Text>
        <DropDownPicker
          open={langOpen}
          value={langValue}
          items={langItems}
          setOpen={setLangOpen}
          setValue={handleSetLanguage}
          setItems={setLangItems}
          style={[
            styles.dropDown,
            {
              backgroundColor: isDarkMode ? "#333" : "#f4f4f4",
              borderColor: isDarkMode ? "#555" : "#ccc",
              zIndex: 10
            },
          ]}
          textStyle={{
            color: isDarkMode ? "#fff" : "#000",
            fontSize: 16 * fontScale,
          }}
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

      {/* Delete Account */}
      {/* Button that opens warning modal */}
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: "#f00" },]} onPress={() => setIsModalOpen(true)}>
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
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDarkMode ? "#fff" : "#000" },]} onPress={() => setIsModalOpen(false)}>
              <Text className="text-center font-light text-2xl text-white">Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    top: 20,
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
