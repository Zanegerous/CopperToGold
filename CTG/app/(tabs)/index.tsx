import { Modal, Text, TouchableOpacity, View } from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Redirect } from "expo-router";
import { auth } from "../firebaseconfig/firebase";

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
    <SafeAreaView
      className={`flex-1 items-center justify-center ${isDarkMode ? "bg-black" : "bg-blue-600"
        }`}
    >
      <Text
        className={`text-center text-3xl ${isDarkMode ? "text-white" : "text-black"
          }`}
      >
        Welcome to the home page
      </Text>

      {/* Button Example */}
      <TouchableOpacity
        onPress={buttonPress}
        className={`${isDarkMode ? "bg-gray-700" : "bg-black"
          } rounded-b-lg rounded-t-2xl w-1/3 h-8 justify-center`}
      >
        <Text
          className={`${isDarkMode ? "text-emerald-300" : "text-emerald-500"
            } text-center text-2xl`}
        >
          Button Example
        </Text>
      </TouchableOpacity>

      <Modal visible={isModalOpen}>
        <SafeAreaView
          className={`${isDarkMode ? "bg-gray-800" : "bg-orange-600"
            } flex-1`}
        >
          <Text
            className={`text-6xl p-2 font-light text-center ${isDarkMode ? "bg-gray-900 text-white" : "bg-red-700 text-black"
              } absolute top-5`}
          >
            Ok I opened
          </Text>

          <TouchableOpacity
            onPress={() => setIsModalOpen(false)}
            className={`w-48 ${isDarkMode ? "bg-gray-500" : "bg-slate-100"
              } p-2 rounded-xl self-center absolute bottom-4`}
          >
            <Text
              className={`text-center ${isDarkMode ? "text-black" : "text-gray-700"
                }`}
            >
              Close Modal
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
