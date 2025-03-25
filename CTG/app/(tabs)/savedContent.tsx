import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, View, Image, TouchableOpacity, Modal } from 'react-native';
import { getAuth, onAuthStateChanged, sendEmailVerification, User } from "firebase/auth";
import { getDatabase, ref as dbRef, onValue, Database, set, remove } from "firebase/database";
import { useEffect, useState } from "react";
import Icon from 'react-native-vector-icons/FontAwesome'
import WebView from "react-native-webview";


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
    const [user, setUser] = useState<User | null>(auth.currentUser);
    const [userUID, setUserUID] = useState<string | undefined>(user?.uid);
    const [database, setDatabase] = useState<Database>(getDatabase());


    const saveRef = dbRef(database, `users/${userUID}/savedItems`);


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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setUserUID(user?.uid);
            setDatabase(getDatabase());
        });
        return () => unsubscribe();
    }, [user]);


    const saveItem = async (item: EbayItem) => {
        const cleanTitle = item.title.replace(/[^a-zA-Z0-9]/g, "_");
        const saveRef = `users/${userUID}/savedItems/${cleanTitle}`
        const itemRef = dbRef(database, saveRef);


        try {
            await set(itemRef, {
                title: item.title,
                price: item.price,
                image: item.image,
                condition: item.condition,
                id: item.id
            });
            console.log('saved Item: ', item.title)
        } catch (error: any) {
            console.error("Save Error: ", error);
        } finally {

        }

    }

    // removing from firebase logic
    const deleteSavedItem = async (item: EbayItem) => {
        const cleanTitle = item.title.replace(/[^a-zA-Z0-9]/g, "_");
        const saveRef = dbRef(database, `users/${userUID}/savedItems/${cleanTitle}`);
        try {

            await remove(saveRef);
            console.log('Removed Item: ', item.title)
        } catch (error: any) {
            console.error("Delete Error: ", error);
        } finally {

        }

    }

    const SavedItem = (item: EbayItem) => {
        const [saveState, setSaveState] = useState(true); // It is already sacved if its showing up here
        const soldPageLink = `https://www.ebay.com/sch/i.html?_nkw=${item.title}&_sacat=0&_from=R40&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1`;
        const [resultModal, setResultModal] = useState(false);
        const [webViewModal, setWebViewModal] = useState(false);

        return (
            <View className="bg-slate-600 flex-1 border-black rounded-md border-spacing-4 border-2 mb-4 mr-5 ml-5 w-2/5">
                <TouchableOpacity onPress={() => setResultModal(true)} className="">
                    <Image
                        source={{ uri: item.image }}
                        className="h-48 m-1 rounded-lg"
                        resizeMode='contain'
                    />
                    <Text className="text-center color-blue-900 font-semibold m-2 rounded-lg bg-zinc-400 text-sm">{item.title}</Text>
                    <Text className="text-left text-l ml-1 text-white">Listed Price: ${item.price.value}</Text>
                    <Text className="text-left ml-1 text-white">Condition: {item.condition}</Text>
                </TouchableOpacity>


                <Modal visible={resultModal} animationType='fade' onRequestClose={() => { setResultModal(false) }}>
                    <SafeAreaView className="bg-blue-dark-200 flex-1">
                        <View className="flex-row justify-between items-center">

                            <TouchableOpacity className=" px-1 mt-4 ml-2  "
                                onPress={() => {
                                    setResultModal(false)
                                }}>
                                <Icon name={'arrow-circle-o-left'} color={'orange'} size={50} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {
                                if (saveState == false) {
                                    saveItem(item);
                                    setSaveState(true);
                                } else {
                                    deleteSavedItem(item);
                                    setSaveState(false);
                                }
                            }}
                                className="mt-4 mr-2 "
                            >
                                <Icon name={'star'} size={50} color={saveState ? 'yellow' : 'grey'} />
                            </TouchableOpacity>

                        </View>
                        <View className="flex-1">
                            <Text className="text-center font-bold text-3xl bg-blue-dark-100 w-auto rounded-xl border-black border-2 mb-2 mt-2 text-white m-1">{item.title}</Text>
                            <Image
                                source={{ uri: item.image }}
                                className="w-11/12 h-1/2 m-1 rounded-lg self-center bg-slate-600"
                                resizeMode='contain'
                            />
                            <Text className="text-left text-3xl ml-4 mt-6 text-white">Listing Price: ${item.price.value}</Text>
                            <Text className="text-left text-3xl ml-4 text-white" >Condition: {item.condition}</Text>
                            <TouchableOpacity onPress={() => setWebViewModal(true)} className="bg-orange-400 rounded-lg border-2 border-black justify-center w-1/2 absolute bottom-2 self-center h-16" >
                                <Text className="text-center text-2xl justify-center text-white">See Sold Items</Text>
                            </TouchableOpacity>
                            <View className="w-full h-2/3 self-center p-5">

                                <Modal visible={webViewModal} animationType='slide' onRequestClose={() => { setWebViewModal(false) }}>
                                    <View className="bg-blue-dark-100">
                                        <TouchableOpacity className=" self-left px-1 mt-2 mb-2 ml-2  "
                                            onPress={() => {
                                                setWebViewModal(false)
                                            }}>
                                            <Icon name={'arrow-circle-o-left'} color={'orange'} size={50} />
                                        </TouchableOpacity>
                                    </View>
                                    <WebView
                                        source={{ uri: soldPageLink }}
                                        scalesPageToFit={true}
                                    />
                                </Modal>
                            </View>
                        </View>



                    </SafeAreaView>
                </Modal>
            </View>
        )
    }



    return (
        <SafeAreaView className="bg-blue-dark-100 flex-1">
            <FlatList
                data={savedList}
                renderItem={({ item }) => <SavedItem {...item} />}
                numColumns={2}
            />
        </SafeAreaView>
    );
}