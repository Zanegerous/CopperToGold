import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import "../../global.css";
import { useTheme } from "../context/ThemeContext";
import { handleLogin } from "../(auth)/login";
import { useRouter } from "expo-router";
import { useTextScale } from "../context/TextScaleContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseconfig/firebase";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const { fontScale } = useTextScale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const onLoginPress = async () => {
    const { success, user, message } = await handleLogin(email, password);

    if (success) {
      router.push("/");
    } else {
      Alert.alert(t("error") || "Error", message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(t("error") || "Error", t("enterEmailFirst") || "Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(t("Success") || "Success", t("resetEmailSent") || "A password reset email has been sent to your email address.");
    } catch (error) {
      Alert.alert(t("error") || "Error", t("resetEmailError") || "An error occurred while sending the reset email. Please try again later.");
    }
  };

  const navigatetoRegister = async () => {
    router.push("/Pages/RegisterPage");
  };

  const scale = (baseSize: number) => baseSize * fontScale;

  return (
    <SafeAreaView
      className={`flex-1 px-4 ${isDarkMode ? "bg-blue-dark-200" : "bg-stone"}`}
    >
      <View className="mt-10 mb-8 items-center">
        <Text
          className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}
          style={{ fontSize: scale(20) }}
        >
          {t("ApplicationLogoName")}
        </Text>
      </View>

      <View className="flex-1 items-center">
        <View className="w-full mb-4">
          <Text className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`} style={{ fontSize: scale(20) }}>
            {t("EmailID")}
          </Text>
          <TextInput
            className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-300 text-white" : "border-gray-600 text-black"}`}
            placeholder={t("EmailBox")}
            placeholderTextColor={isDarkMode ? "#aaa" : "#444"}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
            style={{ fontSize: scale(20) }}
          />
        </View>

        <View className="w-full mb-2">
          <Text className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`} style={{ fontSize: scale(20) }}>
            {t("Password")}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-300 text-white" : "border-gray-600 text-black"}`}
              placeholder={t("PasswordBox")}
              placeholderTextColor={isDarkMode ? "#aaa" : "#444"}
              secureTextEntry={!passwordVisible}
              onChangeText={setPassword}
              value={password}
              style={[styles.textInput, { fontSize: scale(20) }]}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
              <Icon name={passwordVisible ? "eye" : "eye-slash"} size={scale(20)} color={isDarkMode ? "#ddd" : "#000"} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
          <Text className={`underline ${isDarkMode ? "text-green-400" : "text-green-600"}`} style={{ fontSize: scale(16) }}>
            {t("ForgotPassword")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onLoginPress} className="bg-green-500 w-full rounded py-3 mb-4">
          <Text className="text-center text-white text-lg" style={{ fontSize: scale(20) }}>
            {t("SubmitBox")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={navigatetoRegister}>
          <Text className={`underline ${isDarkMode ? "text-green-400" : "text-green-600"}`} style={{ fontSize: scale(20) }}>
            {t("CreateAccount")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: { position: "relative" },
  textInput: { width: "100%" },
  eyeIcon: { position: "absolute", right: 10, top: "50%", transform: [{ translateY: -10 }] },
  forgotPasswordButton: { alignSelf: "flex-end", marginVertical: 8, marginRight: 10 },
});