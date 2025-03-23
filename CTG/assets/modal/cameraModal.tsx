import React, { useRef } from 'react';
import { Modal, TouchableOpacity, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTextScale } from '@/app/context/TextScaleContext';

// const takePictureText = async (camera: { takePictureAsync: () => any } | null) => {
//     if (camera != null) {
//         const photo = await camera.takePictureAsync();
//         console.log(photo.uri)
//         return photo.uri;
//     }
//     return null;
// };

// const textIdentification = async (cameraRef: any) => {
//     const imageURI = await takePictureText(cameraRef);
//     if (imageURI) {
//         try {
//             console.log("starting search")
//             const result = await TextRecognition.recognize(imageURI);
//             alert(result);
//         } catch (error) {
//             console.error('Error recognizing text:', error);
//         }
//     }
// };

interface CameraModalProps {
    cameraOpen: boolean;
    setCameraOpen: React.Dispatch<React.SetStateAction<boolean>>;
    takePicture: (cameraRef: any) => void;
    searchBarcodeResult: (barcodeData: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ cameraOpen, setCameraOpen, takePicture, searchBarcodeResult }) => {
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
                    style={{ borderRadius: 999, borderWidth: 8, borderColor: 'white', position: 'absolute', bottom: 80, width: 96, height: 96, alignSelf: 'center' }}
                />

                {/* <TouchableOpacity
                    onPress={() => textIdentification(cameraRef.current)}
                    style={{ borderRadius: 999, borderWidth: 8, borderColor: 'blue', position: 'absolute', bottom: 50, left: 10, width: 96, height: 96, alignSelf: 'center' }}
                /> */}

            </CameraView>
        </Modal>
    );
};

export default CameraModal;