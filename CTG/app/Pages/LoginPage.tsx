import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import "../../global.css";
import { useTheme } from "../context/ThemeContext";
import { handleLogin } from "../(auth)/login"; 
import { useRouter } from "expo-router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const onLoginPress = async () => {
    const { success, user, message } = await handleLogin(email, password);

    if (success) {
      Alert.alert("Success", "Logged in successfully!");
      console.log("Logged in user:", user);

      // Navigate to the index page after successful login
      router.push("/");
    } else {
      Alert.alert("Error", message);
    }
  };
  const navigatetoRegister = async() => {

    router.push("/Pages/RegisterPage");
  };

  return (
    <SafeAreaView
      className={`flex-1 px-4 ${isDarkMode ? "bg-black" : "bg-white"}`}
    >
      <View className="mt-10 mb-8 items-center">
        <Text
          className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}
        >
          Copper2Gold
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

        {/* Login Button */}
        <TouchableOpacity
          onPress={onLoginPress}
          className="bg-green-500 w-full rounded py-3 mb-4"
        >
          <Text className="text-center text-white text-lg">Submit</Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity onPress={navigatetoRegister}>
          <Text
            className={`underline ${isDarkMode ? "text-green-400" :  "text-green-600"}`}
            >
              Create an Account
            </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
