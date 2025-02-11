import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import "../../global.css";
import { useTheme } from "../context/ThemeContext";
import { registerWithEmailAndPassword } from "../(auth)/register";
import { FirebaseError } from "firebase/app";
import { useRouter } from "expo-router";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const handleRegister = async () => {
    const { user, error } = await registerWithEmailAndPassword(email, password);

    if (error) {
      // If error is a string from validation, show it as an alert
      if (typeof error === "string") {
        Alert.alert("Error", error);
      } else {
        // Handle Firebase error if it's an object
        const firebaseError = error as FirebaseError;
        Alert.alert("Error", firebaseError.message || "An unknown error occurred.");
      }
    } else {
      Alert.alert("Success", "Account created successfully!");
      console.log("Registered user:", user);

      // Redirect to LoginPage
      router.push("/Pages/LoginPage");
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 px-4 ${isDarkMode ? "bg-black" : "bg-white"}`}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >

        <Text style={styles.backButtonText}>{"<"} Back</Text>
      </TouchableOpacity>
      <View className="mt-10 mb-8 items-center">
        <Text
          className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}
        >
          Registration Page
        </Text>
      </View>
      <View className="flex-1 items-center">
        <View className="w-full mb-4">
          <Text
            className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Email ID
          </Text>
          <TextInput
            className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"
              }`}
            placeholder="Enter your email"
            placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
          />
        </View>
        <View className="w-full mb-2">
          <Text
            className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Password
          </Text>
          <TextInput
            className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"
              }`}
            placeholder="Enter your password"
            placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
        </View>
        <View className="w-full mb-4">
          <Text
            className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Security Question
          </Text>
          <TextInput
            className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"
              }`}
            placeholder="Enter your security question."
            placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View className="w-full mb-4">
          <Text
            className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Security Answer
          </Text>
          <TextInput
            className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300"
              }`}
            placeholder="Enter your answer to your security question"
            placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <TouchableOpacity
          onPress={handleRegister}
          className="bg-green-500 w-full rounded py-3"
        >
          <Text className="text-center text-white text-lg">Register</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    left: 6,
    backgroundColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: "#000",
  },
})