import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, Text, TouchableOpacity, View, Modal, Image, TextInput, TouchableWithoutFeedback, Keyboard, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'

// https://docs.expo.dev/versions/latest/sdk/camera/ Expo camera Docs reference

export default function Camera() {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraOpen, isCameraOpen] = useState(false);
    const [photoURI, setPhotoUri] = useState(null);
    const cameraRef = useRef(null);
    const [text, setText] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

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

    const takePicture = async (camera: { takePictureAsync: () => any; } | null) => {
        if (camera != null) {
            const photo = await camera.takePictureAsync();
            setPhotoUri(photo.uri)

            //alert(photoURI)
            isCameraOpen(false);
        } else {
            alert('Null Camera')
        }

    }

    return (
        <SafeAreaView style={{ flex: 1 }} className={backgroundColor}>

            <StatusBar barStyle={'light-content'} className='bg-zinc-900' />

            {/* If a photoURI exists, display it */}
            {photoURI && <Image source={{ uri: photoURI }} className="flex-1 " />}

            {/* Search Input Space */}

            <View className="w-3/4 self-center">
                <TextInput
                    placeholder="Enter Here"
                    value={text} onChangeText={setText}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`w-2/3 absolute top-3 self-center  border-2 rounded-2xl h-12 
                        ${searchFocused ? 'border-blue-500 bg-blue-200' : 'border-black bg-gray-400'}`}
                />

                <TouchableOpacity onPress={() => { alert("You Are Searching for " + text); setText(''); Keyboard.dismiss() }} className=" absolute top-6 right-20 justify-left rounded-lg bg-transparent self-end h-6">
                    <Icon name="search" size={20} color='blue' />
                </TouchableOpacity>


            </View>


            {/* Opens Camera Modal */}
            <TouchableOpacity className="bg-blue-300 rounded-lg w-1/2 h-10 justify-center self-center absolute bottom-4" onPress={() => isCameraOpen(true)}>
                <Text className="text-blue-600 text-center text-xl">
                    Open Camera
                </Text>
            </TouchableOpacity>


            <Modal visible={cameraOpen}>
                {/* Camera Element */}
                <CameraView ref={cameraRef} style={{ flex: 1 }} facing={'back'} mode="picture" onBarcodeScanned={() => alert('Scanned A Barcode')}>
                    {/*Button to close camera*/}
                    <TouchableOpacity className="bg-blue-300 rounded-lg w-1/4 h-10 justify-center self-left px-1 absolute top-4 left-2" onPress={() => isCameraOpen(false)}>
                        <Text className="text-blue-600 text-center text-l">Close Camera</Text>
                    </TouchableOpacity>

                    {/* Button to take picture */}
                    <TouchableOpacity onPress={() => takePicture(cameraRef.current)} className=" rounded-full border-8 border-white absolute bottom-20 w-24 h-24 self-center ">

                    </TouchableOpacity>
                </CameraView>
            </Modal>
        </SafeAreaView>
    );
}