import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, Text, TouchableOpacity, View, Modal, Image, TextInput, Keyboard, StatusBar, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import { WebView } from 'react-native-webview';
import * as FileConversion from 'expo-file-system'
import { FlatList } from 'react-native';
import { searchEbay, searchEbayByImage } from "@/ebayApi";



interface EbayItem {
    title: string;
    price: { value: string; currency: string };
    image: string;
    condition: string;
    id: string;
}
// NOTES: Can use the search to determine average FOR SALE price as the returned image and text data could be utilized to pull each items cost. 
//        Ebay already filters it so even if i call 10000 items and only 52 exist, it will only return 52, not including similar. This is useful
// https://docs.expo.dev/versions/latest/sdk/camera/ Expo camera Docs reference

export default function Camera() {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraOpen, setCameraOpen] = useState(false);
    const [photoURI, setPhotoUri] = useState(null);
    const cameraRef = useRef(null);
    const [text, setText] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [soldPage, setSoldPage] = useState('https://fontawesome.com/icons');
    const [soldModal, setSoldModal] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [searchResultModal, setSearchResultModal] = useState(false);
    const [searchResults, setSearchResults] = useState<EbayItem[]>([]);
    const [textSearchResults, setTextSearchResults] = useState<EbayItem[]>([]);
    const [imageSearchResults, setImageSearchResults] = useState<EbayItem[]>([]);
    const [matchingItems, setMatchingItems] = useState<EbayItem[]>([]);
    const [matchingItemSearch, setMatchingItemSearch] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    let backgroundColor = 'bg-slate-900';

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={{ flex: 1 }}>
                <Text className="bg-black text-white rounded-md text-center text-2xl top-2">We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const dualSearchMerge = () => {
        const textListingIds = new Set(textSearchResults.map(item => item.id))
        const matching = imageSearchResults.filter(item => textListingIds.has(item.id))
        setMatchingItems(matching);
        setMatchingItemSearch(true);
    }

    // This is the formatting for the results, rework it as needed
    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => { alert(item.title) }}
            className="bg-gray-500 border-black rounded-md border-spacing-4"
        >
            <Image
                source={{ uri: item.image }}
            />
            <Text className="text-center color-blue-900 font-bold">{item.title}</Text>
            <Text className="text-center">{item.price.currency} {item.price.value}</Text>
            <Text className="text-center">{item.condition}</Text>
        </TouchableOpacity>
    );

    const handleTakePicture = async (camera: { takePictureAsync: () => any; } | null) => {
        if (camera != null) {
            const photo = await camera.takePictureAsync();
            setPhotoUri(photo.uri)
            setCameraOpen(false);
            searchImageResults(photo.uri)
            //alert(photoURI)

        } else {
            alert('Null Camera')
        }

    }

    const convertImageToBase64 = async (imageUri: string) => {
        const base64 = await FileConversion.readAsStringAsync(imageUri, {
            encoding: FileConversion.EncodingType.Base64,
        });
        //console.log('Base64 Image:', base64); 
        return base64;
    };

    const searchImageResults = async (imageUri: string) => {
        const base64Image = await convertImageToBase64(imageUri);
        // console.log(base64Image)
        setIsLoading(true)
        await searchEbayByImage(base64Image).then((results) => {
            // console.log('Found items: ', results);
            setImageSearchResults(results);
            setSearchResults(results);
            setSearchResultModal(true)
        }).catch((error) => {
            console.error("Error searching eBay with image:", error)
        }).finally(() => {
            setIsLoading(false);
        })

    };

    const searchTextResults = async () => {
        setIsLoading(true)
        if (text != '') {
            await searchEbay(text).then((results) => {
                // console.log('Found items: ', results.length);
                setTextSearchResults(results);
                setSearchResults(results);
                console.log(results)
                setSearchResultModal(true);
            }).catch((error) => {
                console.log('Error Searching eBay with text:', error);
            }).finally(() => {
                setIsLoading(false)
            })
            setText('');
            Keyboard.dismiss();
        } else {
            alert('Must Enter Search')
        }

    }

    const searchBarcodeResult = (barcode: string) => {
        setCameraOpen(false)
        setText(barcode)
        alert('Text has been set to: ' + text)
    }

    const searchSold = () => {
        if (text === '') {
            alert("Must Enter Search");
        } else {
            setSoldModal(true);
            setSoldPage(`https://www.ebay.com/sch/i.html?_nkw=${text}&_sacat=0&_from=R40&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1`);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }} className={backgroundColor}>

            <View>
                <Text className="text-center bg-white text-4xl top-8 w-5/6 self-center">Not In Use</Text>
            </View>


        </SafeAreaView>
    );
}