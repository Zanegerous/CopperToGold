import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import Icon from 'react-native-vector-icons/FontAwesome'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', tabBarActiveBackgroundColor: 'lightgreen', tabBarInactiveBackgroundColor: 'grey', tabBarInactiveTintColor: 'white' }}>
      <Tabs.Screen name="index" options={{ headerShown: false, title: "Home", tabBarIcon: ({ color }) => <Icon name="tasks" size={25} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ headerShown: false, title: "Settings", tabBarIcon: ({ color }) => <Icon name="gear" size={25} color={color} /> }} />
      <Tabs.Screen name="colors" options={{ headerShown: false, title: "ColorTest", tabBarIcon: ({ color }) => <Icon name="certificate" size={25} color={color} /> }} />
      <Tabs.Screen name="camera" options={{ headerShown: false, title: "CameraTest", tabBarIcon: ({ color }) => <Icon name="video-camera" size={25} color={color} /> }} />
    </Tabs>
  )



}