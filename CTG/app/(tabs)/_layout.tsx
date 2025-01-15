import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{tabBarActiveTintColor: 'blue'}}>
      <Tabs.Screen name="index" options={{headerShown: false, title: "Home"}} />
      <Tabs.Screen name="settings" options={{headerShown: false, title: "Settings"}} />
      <Tabs.Screen name="searchResults" options={{headerShown: false, title: "Results"}} />
      {/* Don't allow the listings page to be a tab option, but allow the tab to be on listings page*/}
      <Tabs.Screen name="listings/[id]" options={{headerShown: false, title: "Results", href: null}} />
    </Tabs>
  )



}