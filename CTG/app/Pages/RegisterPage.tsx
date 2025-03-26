import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import "../../global.css";
import { useTheme } from "../context/ThemeContext";
import { registerWithEmailAndPassword } from "../(auth)/register";
import { FirebaseError } from "firebase/app";
import { useRouter } from "expo-router";
import { useTextScale } from "../context/TextScaleContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const { t } = useTranslation();
  const { fontScale } = useTextScale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secQuestion, setSecQuestion] = useState("");
  const [secAnswer, setSecAnswer] = useState("");
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleRegister = async () => {
    const { user, error } = await registerWithEmailAndPassword(email, password, secQuestion, secAnswer);

    if (error) {
      if (typeof error === "string") {
        Alert.alert("Error", error);
      } else {
        const firebaseError = error as FirebaseError;
        Alert.alert("Error", firebaseError.message || "An unknown error occurred.");
      }
    } else {
      // Inform the user to verify their email.
      Alert.alert(
        "Success",
        "Account created successfully! Please check your email to verify your account before logging in."
      );
      console.log("Registered user:", user);
      router.push("/Pages/LoginPage");
    }
  };

  const scale = (baseSize: number) => baseSize * fontScale;

  return (
    <SafeAreaView className={`flex-1 px-4 ${isDarkMode ? "bg-black" : "bg-blue-dark"}`}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>{"<"} Back</Text>
      </TouchableOpacity>
      <View className="mt-10 mb-8 items-center">
        <Text
          className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-white"}`}
          style={{ fontSize: scale(20) }}
        >
          {t("RegistrationPage")}
        </Text>
      </View>
      {/* Email Field */}
      <View className="flex-1 items-center">
              <View className="w-full mb-4">
                <Text className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} style={{ fontSize: scale(20) }}>
                  {t("EmailID")}
                </Text>
                <TextInput
                  className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300 text-white"}`}
                  placeholder={t("EmailBox")}
                  placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  value={email}
                  style={{ fontSize: scale(20) }}
                />
              </View>
        {/* Password Field */}
        <View className="w-full mb-2">
                  <Text className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} style={{ fontSize: scale(20) }}>
                    {t("Password")}
                  </Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300 text-white"}`}
                      placeholder={t("PasswordBox")}
                      placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
                      secureTextEntry={!passwordVisible}
                      onChangeText={setPassword}
                      value={password}
                      style={[styles.textInput, { fontSize: scale(20) }]}
                    />
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
                      <Icon name={passwordVisible ? "eye" : "eye-slash"} size={scale(20)} color={isDarkMode ? "#fff" : "#ddd"} />
                    </TouchableOpacity>
                  </View>
                </View>
        {/* Security Question */}
        <View className="w-full mb-4">
          <Text
            className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} style={{ fontSize: scale(20)}}
          >
            {t("SecurityQuestion")}
          </Text>
          <TextInput
            className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300 text-white"
              }`}
            placeholder={t("SecurityQuestionBox")}
            placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
            autoCapitalize="none"
            onChangeText={setSecQuestion}
            value={secQuestion}
            style={[styles.textInput, {fontSize: scale(20)}]}
          />
        </View>
        <View className="w-full mb-4">
          <Text
            className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} style={{ fontSize: scale(20)}}
          >
            {t("SecurityAnswer")}
          </Text>
          <TextInput
            className={`border rounded px-3 py-2 ${isDarkMode ? "border-gray-500 text-white" : "border-gray-300 text-white"
              }`}
            placeholder={t("SecurityAnswerBox")}
            placeholderTextColor={isDarkMode ? "#999" : "#aaa"}
            autoCapitalize="none"
            onChangeText={setSecAnswer}
            value={secAnswer}
            style={[styles.textInput, {fontSize: scale(20)}]}
          />
        </View>
        <TouchableOpacity
          onPress={handleRegister}
          className="bg-green-500 w-full rounded py-3"
        >
          <Text className="text-center text-white text-lg" style={{ fontSize: scale(20) }} >
            {t("RegisterAccount")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    left: 6,
    top: 60,
    backgroundColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#000",
  },
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
});
