import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import "../../global.css";
import { useTheme } from "../context/ThemeContext";
import { registerWithEmailAndPassword } from "../Auth/register";
import { FirebaseError } from "firebase/app";
import { useRouter } from "expo-router";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const handleRegister = async () => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    // Password validation regex
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
  
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character."
      );
      return;
    }
  
    // Proceed with Firebase registration if validations pass
    const { user, error } = await registerWithEmailAndPassword(email, password);
    if (error) {
      const firebaseError = error as FirebaseError;
      Alert.alert("Error", firebaseError.message || "An unknown error occurred");
    } else {
      Alert.alert("Success", "Account created successfully!");
      console.log("Registered user:", user);

      router.push("/Pages/LoginPage");
      
    }
  };
  

  return (
    <SafeAreaView
      className={`flex-1 px-4 ${isDarkMode ? "bg-black" : "bg-white"}`}
    >
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
            className={`border rounded px-3 py-2 ${
              isDarkMode ? "border-gray-500 text-white" : "border-gray-300"
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
            className={`border rounded px-3 py-2 ${
              isDarkMode ? "border-gray-500 text-white" : "border-gray-300"
            }`}
            placeholder="Enter your password"
            placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
            secureTextEntry
            onChangeText={setPassword}
            value={password}
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
