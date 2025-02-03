// app/index.tsx
import React, { useState } from "react";
import {Modal,Text,TouchableOpacity,View,StyleSheet, SafeAreaView,} from "react-native";
import { useRouter, Redirect } from "expo-router";
import { auth } from "../firebaseconfig/firebase";
import { useTheme } from "../context/ThemeContext";
import { useTextScale } from "../context/TextScaleContext";

export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Access the router for going back
  const router = useRouter();

  // Current logged-in user
  const user = auth.currentUser;

  // Access dark mode from ThemeContext
  const { isDarkMode } = useTheme();

  // Access your chosen fontScale from TextScaleContext
  const { fontScale } = useTextScale();

  // If no user is logged in, redirect
  if (!user) {
    return <Redirect href="/Pages/LoginPage" />;
  }

  // Simple button handler
  const buttonPress = () => {
    alert("Button Pressed, I'll open the modal");
    setIsModalOpen(true);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "black" : "blue" },
      ]}
    >

      <Text
        style={{
          textAlign: "center",
          fontSize: 30 * fontScale,
          color: isDarkMode ? "#FFFFFF" : "#000000",
          marginBottom: 16,
        }}
      >
        Welcome to the home page
      </Text>

      {/* Example button that opens a modal */}
      <TouchableOpacity
        onPress={buttonPress}
        style={[
          styles.button,
          { backgroundColor: isDarkMode ? "#555" : "#000" },
        ]}
      >
        <Text
          style={{
            color: "#fff",
            textAlign: "center",
            fontSize: 20 * fontScale,
          }}
        >
          Button Example
        </Text>
      </TouchableOpacity>

      {/* Modal that uses the same contexts */}
      <Modal visible={isModalOpen} animationType="slide">
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: isDarkMode ? "#222" : "orange" },
          ]}
        >
          <Text
            style={{
              fontSize: 36 * fontScale,
              color: isDarkMode ? "#fff" : "#000",
              marginBottom: 24,
            }}
          >
            Ok I opened
          </Text>
          <TouchableOpacity
            onPress={() => setIsModalOpen(false)}
            style={[
              styles.closeButton,
              { backgroundColor: isDarkMode ? "#888" : "#ddd" },
            ]}
          >
            <Text
              style={{
                textAlign: "center",
                color: isDarkMode ? "#000" : "#333",
                fontSize: 18 * fontScale,
              }}
            >
              Close Modal
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderRadius: 10,
    width: "40%",
    height: 40,
    justifyContent: "center",
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 120,
    padding: 12,
    borderRadius: 10,
  },
});
