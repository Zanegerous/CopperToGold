import { Modal, Text, TouchableOpacity, View } from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Redirect } from "expo-router";
import { auth } from "../firebaseconfig/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch the auth status
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [loading, setLoading] = useState(true); // This solves race condition, see note below
  const { isDarkMode } = useTheme(); // This is for accessing darkmode from ThemeContext

  /*
  * This comment is explaining the race condition. It's related to authentication persistance.
  * Firebase has a built in function for auth persistance, and react has an integration for that persistance.

  * HOWEVER, when I set everything up in index, I found out there's a really funny interaction: user defaults to null until it communicates with firebase and actually sets user. For whatever reason, this isn't considered async so there's no await. So, the page loads, sees that user is null, and automatically redirects to the login page before firebase can come in and confirm the user is logged in.

  * My solution was to add a loading state that defaults to true, and set it to false in the first useEffect. Then, if the page is loading it displays the splash screen, and once it's done loading it either displays the home page or brings you to the login page. */

  // Everytime the auth state changes (such as firebase loading the persisted user), this sets the user to whatever the new user state is (either the user who is logged in, or null), then sets loading to false.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        console.log("USER IS LOGGED IN: " , user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // when the page is done loading hide the splash screen
  useEffect(() => {
    if(!loading) SplashScreen.hide()
  }, [loading])

  // Simple button handler
  const buttonPress = () => {
    alert("Button Pressed, I'll open the modal");
    setIsModalOpen(true);
  };

  // Render home page is user is logged in and everything is loaded
  if (!loading && user){
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

  // Redirect to login page if user isn't logged in and everything is loaded
  if (!loading && !user) {
    console.log("USER IS NULL, AND THUS NOT LOGGED IN");
    return <Redirect href="/Pages/LoginPage" />;
  };

  /*
  * While loading, display that the page is loading
  * This should always be behind the splash screen, but I'm leaving it here anyways just to be safe */
  if(loading){
    return(
      <SafeAreaView
        className={`flex-1 items-center justify-center ${isDarkMode ? "bg-black" : "bg-blue-600"
        }`}
      >
        <Text
          className={`text-center text-3xl ${isDarkMode ? "text-white" : "text-black"
            }`}
        >
          Loading...
        </Text>
      </SafeAreaView>
    )
  }
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
