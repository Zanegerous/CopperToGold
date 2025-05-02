import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import Icon from 'react-native-vector-icons/FontAwesome'

export default function TabLayout() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? 'orange' : '#56494C',
        tabBarActiveBackgroundColor: isDarkMode ? 'darkblue' : '#E4C5Af',
        tabBarInactiveBackgroundColor: isDarkMode ? 'grey' : '#074f57',
        tabBarInactiveTintColor: isDarkMode ? 'darkblue' : '#AFBFC0',
      }}
    >
      <Tabs.Screen name="settings" options={{ headerShown: false, title: "", tabBarIcon: ({ color }) => <Icon name="gear" size={25} color={color} /> }} />
      <Tabs.Screen name="map" options={{ headerShown: false, title: "", tabBarIcon: ({ color }) => <Icon name="map-marker" size={25} color={color} /> }} />
      <Tabs.Screen name="index" options={{ headerShown: false, title: "", tabBarIcon: ({ color }) => <Icon name="tasks" size={25} color={color} /> }} />
      <Tabs.Screen name="savedContent" options={{ headerShown: false, title: "", tabBarIcon: ({ color }) => <Icon name="star" size={25} color={color} /> }} />
      <Tabs.Screen name="BOLO" options={{ headerShown: false, title: "", tabBarIcon: ({ color }) => <Icon name="eye" size={25} color={color} /> }} />
      {/* Don't allow the listings page to be a tab option, but allow the tab to be on listings page*/}
    </Tabs>
  )



}