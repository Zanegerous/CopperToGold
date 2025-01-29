import { Modal, Text, TouchableOpacity, View } from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Redirect } from "expo-router";
import { auth } from "../firebaseconfig/firebase";
import { WebView } from "react-native-webview"

export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = auth.currentUser; // This is to see the user that's currently logged in
  const { isDarkMode } = useTheme(); // This is for accessing darkmode from ThemeContext

  if (!user) {
    // Redirect to the login page if no user is logged in
    return <Redirect href="/Pages/LoginPage" />;
  }

  // Example button press functions
  const buttonPress = () => {
    alert("Button Pressed, I'll open the modal");
    setIsModalOpen(true);
  };

  return (
    <View style={{ width: '100%', height: '100%' }} className="absolute top-16">
      <WebView style={{ height: '80%' }} source={{ uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }} />
    </View>
  );
}
