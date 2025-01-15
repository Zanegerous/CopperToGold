import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";

export default function Settings() {
    return (
        <SafeAreaView className="bg-slate-900 flex-1">
            <Text className="text-white"> Welcome to the settings page </Text>
        </SafeAreaView>
    )
}