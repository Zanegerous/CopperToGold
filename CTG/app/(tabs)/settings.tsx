import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert, Modal } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useTextScale } from "../context/TextScaleContext";
import { auth } from "../firebaseconfig/firebase";
import { useRouter } from "expo-router";
import { useNotifSetting } from "../context/NotificationContext";
import i18n from "../i18n";

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
  const [language, setLanguage] = useState('');
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
    { label: i18n.t("englishLabel"), value: "en" },
    { label: i18n.t("spanishLabel"), value: "es" },
  ]);

  // Force re-render for language changes
  const [renderCount, setRenderCount] = useState(0);
  useEffect(() => {
    const handleLanguageChanged = () => {
      // Rebuild language dropdown items on language change
      setLangItems([
        { label: i18n.t("englishLabel"), value: "en" },
        { label: i18n.t("spanishLabel"), value: "es" },
      ]);
      setRenderCount((prev) => prev + 1);
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

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

  const handleDelete = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User does not exist");
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

  // Updated language setter to handle function values
  const handleSetLanguage = (selectedLang: string | ((prev: string) => string)) => {
    const lang = typeof selectedLang === "function" ? selectedLang(langValue) : selectedLang;
    console.log("Selected language:", lang);
    setLangValue(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? "#000" : "#fff" }]}>
      {/* Title */}
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000", fontSize: 18 * fontScale }]}>
        {i18n.t("settingsTitle")}
      </Text>

      {/* Dark Mode Switch */}
      <View style={styles.switchContainer}>
        <Text style={{ color: isDarkMode ? "#fff" : "#000", fontSize: 16 * fontScale }}>
          {i18n.t("darkMode")}
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
          {i18n.t("turnNotifOff")}
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
        <Text style={{ color: isDarkMode ? "#fff" : "#000", fontSize: 16 * fontScale, marginBottom: 8 }}>
          {i18n.t("textSize")}
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
            { backgroundColor: isDarkMode ? "#333" : "#f4f4f4", borderColor: isDarkMode ? "#555" : "#ccc" },
          ]}
          textStyle={{ color: isDarkMode ? "#fff" : "#000", fontSize: 16 * fontScale }}
          dropDownContainerStyle={{ backgroundColor: isDarkMode ? "#333" : "#f4f4f4", borderColor: isDarkMode ? "#555" : "#ccc" }}
          placeholderStyle={{ color: isDarkMode ? "#ccc" : "#888" }}
        />
      </View>

      {/* Language Picker */}
      <View style={styles.pickerContainer}>
        <Text style={{ color: isDarkMode ? "#fff" : "#000", fontSize: 16 * fontScale, marginBottom: 8, marginTop: 16 }}>
          {i18n.t("language")}
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
            { backgroundColor: isDarkMode ? "#333" : "#f4f4f4", borderColor: isDarkMode ? "#555" : "#ccc", zIndex: 10 },
          ]}
          textStyle={{ color: isDarkMode ? "#fff" : "#000", fontSize: 16 * fontScale }}
          dropDownContainerStyle={{ backgroundColor: isDarkMode ? "#333" : "#f4f4f4", borderColor: isDarkMode ? "#555" : "#ccc" }}
          placeholderStyle={{ color: isDarkMode ? "#ccc" : "#888" }}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: "#f00" }]} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: "#fff", fontSize: 16 * fontScale }]}>
          {i18n.t("logout")}
        </Text>
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: "#f00" }]} onPress={() => setIsModalOpen(true)}>
        <Text style={[styles.logoutText, { color: isDarkMode ? "#fff" : "#fff", fontSize: 16 * fontScale }]}>
          {i18n.t("deleteAccount")}
        </Text>
      </TouchableOpacity>

      {/* Warning Modal */}
      <Modal visible={isModalOpen} transparent={true}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ flex: 1, marginHorizontal: 20, marginVertical: 150, backgroundColor: "#fff", borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ textAlign: "center", fontSize: 20 }}>
              {i18n.t("warningText")}
            </Text>
            <Text style={{ textAlign: "center", fontWeight: "bold", color: "#f00", fontSize: 20 }}>
              {i18n.t("warningTextBold")}
            </Text>
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: "#f00" }]} onPress={handleDelete}>
              <Text style={[styles.logoutText, { color: "#fff" }]}>
                {i18n.t("deleteAccount")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDarkMode ? "#fff" : "#000" }]} onPress={() => setIsModalOpen(false)}>
              <Text style={{ textAlign: "center", fontSize: 20, color: "#fff" }}>
                {i18n.t("cancel")}
              </Text>
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
