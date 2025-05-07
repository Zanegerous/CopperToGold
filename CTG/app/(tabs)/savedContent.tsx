import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, View, Image, TouchableOpacity, Modal } from 'react-native';
import { getAuth, onAuthStateChanged, sendEmailVerification, User } from "firebase/auth";
import { getDatabase, ref as dbRef, onValue, Database, set, remove } from "firebase/database";
import { useEffect, useState } from "react";
import Icon from 'react-native-vector-icons/FontAwesome'
import WebView from "react-native-webview";
import UploadDraftModal from "@/assets/modal/uploadDraft";
import { useTheme } from "../context/ThemeContext";


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
    const { isDarkMode } = useTheme();


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

    const darkModeStyles = {
        container: 'bg-slate-600 border-black',
        itemTitle: 'color-blue-900 bg-zinc-400',
        listedPrice: 'text-white',
        condition: 'text-white',
        resultModalContainer: 'bg-blue-dark-200',
        modalTitle: 'bg-blue-dark-100 border-black text-white',
        modalListedPrice: 'text-white',
        modalCondition: 'text-white',
        modalButton: 'bg-orange-400 border-black',
        modalButtonText: 'text-white'

    };

    const lightModeStyles = {
        container: 'bg-blue-300 border-black',
        itemTitle: 'text-blue-900 bg-blue-200',
        listedPrice: 'text-black',
        condition: 'text-black',
        resultModalContainer: 'bg-blue-200',
        modalTitle: 'bg-blue-100 border-black text-black',
        modalListedPrice: 'text-black',
        modalCondition: 'text-black',
        modalButton: 'bg-orange-300 border-black',
        modalButtonText: 'text-black font-semibold',
    };

    const themeStyles = isDarkMode ? darkModeStyles : lightModeStyles;

    const SavedItem = (item: EbayItem) => {
        const [saveState, setSaveState] = useState(true); // It is already sacved if its showing up here
        const soldPageLink = `https://www.ebay.com/sch/i.html?_nkw=${item.title}&_sacat=0&_from=R40&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1`;
        const [resultModal, setResultModal] = useState(false);
        const [webViewModal, setWebViewModal] = useState(false);
        const [draftModal, setDraftModal] = useState(false);

        return (
            <View className={`flex-1 rounded-md border-spacing-4 border-2 mb-4 mr-5 ml-5 w-2/5 ${themeStyles.container}`}>
                <TouchableOpacity onPress={() => setResultModal(true)} className="">
                    <Image
                        source={{ uri: item.image }}
                        className="h-48 m-1 rounded-lg"
                        resizeMode='contain'
                    />
                    <Text className={`text-center font-semibold m-2 rounded-lg  text-sm ${themeStyles.itemTitle}`}>{item.title}</Text>
                    <Text className={`text-left text-l ml-1 ${themeStyles.listedPrice}`}>Listed Price: ${item.price.value}</Text>
                    <Text className={`text-left ml-1 ${themeStyles.condition}`}>Condition: {item.condition}</Text>
                </TouchableOpacity>



                <Modal visible={resultModal} animationType='fade' onRequestClose={() => { setResultModal(false) }}>
                    <SafeAreaView className={`flex-1 ${themeStyles.resultModalContainer}`}>
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
                            <Text className={`text-center font-bold text-3xl w-auto rounded-xl border-2 mb-2 mt-2 m-1 ${themeStyles.modalTitle}`}>{item.title}</Text>
                            <Image
                                source={{ uri: item.image }}
                                className="w-11/12 h-1/2 m-1 rounded-lg self-center bg-slate-600"
                                resizeMode='contain'
                            />
                            <Text className={`text-left text-3xl ml-4 mt-6 ${themeStyles.modalListedPrice}`}>Listing Price: ${item.price.value}</Text>
                            <Text className={`text-left text-3xl ml-4 ${themeStyles.modalCondition}`}>Condition: {item.condition}</Text>

                            <View className="flex-row bottom-4 absolute justify-center w-full">
                                <TouchableOpacity onPress={() => setWebViewModal(true)} className={`rounded-lg border-2  justify-center w-[80%] bottom-2 self-center h-20 right-2 ${themeStyles.modalButton}`} >
                                    <Text className={`text-center text-2xl justify-center ${themeStyles.modalButtonText}`}>See Sold Items</Text>
                                </TouchableOpacity>

                                {/* <TouchableOpacity
                                    onPress={() => setDraftModal(true)}
                                    className=bg-orange-400 rounded-lg border-2 border-black justify-center w-[40%] bottom-2 self-center h-20 left-2"
                                >
                                    <Text className="text-center text-xl justify-center text-white">List Similar</Text>
                                </TouchableOpacity> */}
                            </View>

                            <View className="w-full h-2/3 self-center p-5">

                                <Modal visible={webViewModal} animationType='slide' onRequestClose={() => { setDraftModal(false) }}>
                                    <View className={`${themeStyles.resultModalContainer}`}>
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

                {/* <UploadDraftModal
                    visible={draftModal}
                    onClose={() => setDraftModal(false)}
                    itemName={item.title}
                    itemPrice={item.price.value}
                    itemCondition={item.condition}
                    itemImage={item.image}
                /> */}

            </View >
        )
    }

    return (
        <SafeAreaView className={`flex-1 ${themeStyles.resultModalContainer}`}>
            <FlatList
                data={savedList}
                renderItem={({ item }) => <SavedItem {...item} />}
                numColumns={2}
            />
        </SafeAreaView>
    );
}