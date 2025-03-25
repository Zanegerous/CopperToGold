import React, { useRef } from 'react';
import { Modal, TouchableOpacity, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTextScale } from '@/app/context/TextScaleContext';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getDatabase, ref as dbRef, set } from 'firebase/database';
import axios from 'axios';
import { getUserID } from '@/app/functionForApp/simpleFunctions';


const takePictureText = async (camera: { takePictureAsync: () => any } | null) => {
    try {
        if (camera != null) {
            const apiKey = ''; // Check discord for it, will need to be moved later to backend, fine here for now, just dont push to github with it
            const photo = await camera.takePictureAsync();
            const urifetch = await fetch(photo.uri);
            const blob = await urifetch.blob();
            const storage = getStorage();
            const dateUploadTime = Date.now()
            // upload the image ref
            const folderLocation = `user/${getUserID()}/temp/${dateUploadTime}.jpg`
            const imageRef = storageRef(storage, folderLocation);
            await uploadBytes(imageRef, blob);
            const firebaseUrl = await getDownloadURL(imageRef);

            const endpointUrl = `https://api.apilayer.com/image_to_text/url?url=${encodeURIComponent(firebaseUrl)}`;

            const response = await axios.get(endpointUrl, {
                headers: {
                    apiKey: apiKey,
                },
            });

            const text = response.data.all_text;

            // remove it once done.
            await deleteObject(imageRef);
            return text;
        }
    } catch (error) {
        console.error('Error: ', error);
        return 'Error'
    }
};

interface CameraModalProps {
    cameraOpen: boolean;
    setCameraOpen: React.Dispatch<React.SetStateAction<boolean>>;
    takePicture: (cameraRef: any) => void;
    searchBarcodeResult: (barcodeData: string) => void;
    setText: React.Dispatch<React.SetStateAction<string>>;
    setLoadingSymbolState: React.Dispatch<React.SetStateAction<boolean>>;
    handleSearchOpen: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ cameraOpen, setCameraOpen, takePicture, searchBarcodeResult, setText, setLoadingSymbolState, handleSearchOpen }) => {
    const cameraRef = useRef<any>(null);
    const { fontScale } = useTextScale();
    const scale = (baseSize: number) => baseSize * fontScale;

    return (
        <Modal visible={cameraOpen} onRequestClose={() => { setCameraOpen(false) }}>
            <CameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                facing={"back"}
                mode="picture"
                mute={true}
                animateShutter={false}
                barcodeScannerSettings={{
                    barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "itf14"],
                }}
                onBarcodeScanned={({ data }) => searchBarcodeResult(data)}
            >
                {/* Close Camera Button */}
                <TouchableOpacity
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)', borderRadius: 8, width: '25%', height: 40, justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, position: 'absolute', top: 16, left: 8 }}
                    onPress={() => setCameraOpen(false)}
                >
                    <Text style={{ fontSize: scale(16), color: '#1D4ED8', textAlign: 'center' }}>
                        Close
                    </Text>
                </TouchableOpacity>

                {/* Take Picture Button */}

                <TouchableOpacity
                    onPress={() => takePicture(cameraRef.current)}
                    style={{ borderRadius: 999, borderWidth: 8, borderColor: 'white', position: 'absolute', bottom: 80, right: 60, width: 96, height: 96, alignSelf: 'center' }}
                >
                    <Text className='text-white self-center text-xl mt-4 '>Search</Text>
                    <Text className='text-white self-center text-xl'>Image</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={async () => {
                        setLoadingSymbolState(true);
                        const text = await takePictureText(cameraRef.current);
                        setCameraOpen(false);
                        setText(text);
                        setLoadingSymbolState(false);
                        handleSearchOpen();
                    }}
                    style={{ borderRadius: 999, borderWidth: 8, borderColor: 'blue', position: 'absolute', bottom: 80, left: 60, width: 96, height: 96, alignSelf: 'center' }}
                >
                    <Text className='text-white self-center text-xl mt-4'>Scan</Text>
                    <Text className='text-white self-center text-xl'>Text</Text>
                </TouchableOpacity>
            </CameraView>
        </Modal>
    );
};

export default CameraModal;