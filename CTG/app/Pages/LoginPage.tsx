import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text,TextInput,TouchableOpacity,Alert,StyleSheet,} from "react-native";
import "../../global.css";
import { useTheme } from "../context/ThemeContext";
import { handleLogin } from "../(auth)/login";
import { useRouter } from "expo-router";
import { useTextScale } from "../context/TextScaleContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseconfig/firebase";

export default function LoginPage() {
  const { fontScale } = useTextScale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { isDarkMode } = useTheme();
  const router = useRouter();

  // Login handler remains unchanged
  const onLoginPress = async () => {
    const { success, user, message } = await handleLogin(email, password);

    if (success) {
      Alert.alert("Success", "Logged in successfully!");
      console.log("Logged in user:", user);
      router.push("/");
    } else {
      Alert.alert("Error", message);
    }
  };

  // Forgot Password handler using Firebase's sendPasswordResetEmail
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Success",
        "A password reset email has been sent to your email address."
      );
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert(
        "Error",
        "An error occurred while sending the reset email. Please try again later."
      );
    }
  };

  const navigatetoRegister = async () => {
    router.push("/Pages/RegisterPage");
  };

  const scale = (baseSize: number) => baseSize * fontScale;

  return (
    <SafeAreaView
      className={`flex-1 px-4 ${isDarkMode ? "bg-black" : "bg-blue-dark"}`}
    >
      <View className="mt-10 mb-8 items-center">
        <Text
          className={`text-3xl font-bold ${isDarkMode ? "#fff" : "text-white"}`}
          style={{ fontSize: scale(20) }}
        >
          Copper2Gold
        </Text>
      </View>
      <View className="flex-1 items-center">
        {/* Email Input */}
        <View className="w-full mb-4">
          <Text
            className={`mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
            style={{ fontSize: scale(20) }}
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
            style={{ fontSize: scale(20) }}
          />
        </View>
        {/* Password Input with Show/Hide Toggle */}
        <View className="w-full mb-2">
          <Text
            className={`mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
            style={{ fontSize: scale(20) }}
          >
            Password
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              className={`border rounded px-3 py-2 ${
                isDarkMode ? "border-gray-500 text-white" : "border-gray-300"
              }`}
              placeholder="Enter your password"
              placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
              secureTextEntry={!passwordVisible}
              onChangeText={setPassword}
              value={password}
              style={[styles.textInput, { fontSize: scale(20) }]}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.eyeIcon}
            >
              <Icon
                name={passwordVisible ? "eye" : "eye-slash"}
                size={scale(20)}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPasswordButton}
        >
          <Text
            className={`underline ${
              isDarkMode ? "text-green-400" : "text-green-600"
            }`}
            style={{ fontSize: scale(16) }}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>
        {/* Login Button */}
        <TouchableOpacity
          onPress={onLoginPress}
          className="bg-green-500 w-full rounded py-3 mb-4"
        >
          <Text
            className="text-center text-white text-lg"
            style={{ fontSize: scale(20) }}
          >
            Submit
          </Text>
        </TouchableOpacity>
        {/* Register Button */}
        <TouchableOpacity onPress={navigatetoRegister}>
          <Text
            className={`underline ${
              isDarkMode ? "text-green-400" : "text-green-600"
            }`}
            style={{ fontSize: scale(20) }}
          >
            Create an Account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    position: "relative",
  },
  textInput: {
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginVertical: 8,
    marginRight: 10,
  },
});
