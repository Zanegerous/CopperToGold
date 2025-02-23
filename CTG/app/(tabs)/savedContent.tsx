import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, View, Image } from 'react-native';
import { getAuth, sendEmailVerification } from "firebase/auth";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import { useEffect, useState } from "react";


interface EbayItem {
    title: string;
    price: { value: string; currency: string };
    image: string;
    condition: string;
    id: string;
}


export default function SavedContent() {

    const [savedList, setSavedList] = useState<EbayItem[]>([]);

    const auth = getAuth();
    const user = auth.currentUser;
    const db = getDatabase();
    const refDB = dbRef(getDatabase());
    const userUID = user?.uid;
    const saveRef = dbRef(db, `users/${userUID}/savedItems`);

    useEffect(() => {
        const unsubscribe = onValue(saveRef, async (snapshot) => { // This creates a mounting point to listen to the savedItems position for updates.

            const savedSnapshot = snapshot.val();
            const savedSet: EbayItem[] = [];

            for (let item in savedSnapshot) {
                const data = savedSnapshot[item];

                savedSet.push({
                    title: data.title,
                    price: data.price,
                    image: data.image,
                    condition: data.condition,
                    id: data.id
                });
            }

            setSavedList(savedSet);
        });
        return () => unsubscribe(); // This cunmounts the listener when moving between pages
    }, [userUID]);


    const SavedItem = ({ title, price, image, condition, id }: EbayItem) => {
        const [unsaveState, setUnsaveState] = useState(false);

        return (
            <View>
                <Text>Title: {title}</Text>
                <Text>Price: {price.value}{price.currency}</Text>
                <Image source={{ uri: image }} />
                <Text>Condition: {condition}</Text>
                <Text>ID: {id}</Text>
            </View>
        )
    }



    return (
        <SafeAreaView className="bg-blue-dark-100 flex-1">
            <FlatList data={savedList} renderItem={({ item }) => <SavedItem {...item} />} />
        </SafeAreaView>
    );
}