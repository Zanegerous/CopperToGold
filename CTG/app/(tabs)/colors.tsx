import React from "react";
import { View } from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";


// This is specifically for testing out some color profiles
export default function Colors() {
    return (

        <SafeAreaView className='flex-1 self-center m-2 flex-col'>
            <View className="bg-blue-800 w-48 h-48 m-1 border-dashed border-8 rounded-3xl border-black"></View>
            <View className="bg-cyan-700 w-48 h-48 m-1 border-4 border-dotted rounded-e-3xl"></View>
            <View className="bg-yellow-300 w-48 h-48 m-1 border-double border-4 border-blue-700 rounded-l-full"></View>
            <View className="bg-orange-400 w-48 h-48 m-1"></View>
            <View className="bg-orange-800 w-48 h-48 m-1"></View>

        </SafeAreaView>
    )
}