import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";


export default function TabLayout() {
  return (
    <Tabs screenOptions={{tabBarActiveTintColor: 'blue'}}>
      <Tabs.Screen name="index" options={{headerShown: false, title: "Home"}} />
      <Tabs.Screen name="settings" options={{headerShown: false, title: "Settings"}} />
    </Tabs>
  )



}