import { uploadDraft } from "@/ebayApi";
import { CameraView } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Text, TouchableOpacity, View, Image, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native"
import { TextInput } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/FontAwesome'
import { Picker } from '@react-native-picker/picker';



type UploadDraftModalProps = {
    visible: boolean;
    onClose: () => void;
    itemName: string;
    itemPrice: string;
    itemCondition: string;
    itemImage: any;

};

const getItemImageLink = () => {

}

const takePicture = async (camera: { takePictureAsync: () => any } | null) => {
    if (camera != null) {
        const photo = await camera.takePictureAsync();
        return photo.uri;
    }
};

const UploadDraftModal = ({ visible, onClose, itemName, itemPrice, itemCondition, itemImage }: UploadDraftModalProps) => {

    // Reloads modal to list similar values, that way it doesnt roll over after submitting
    useEffect(() => {
        if (visible) {
            setItemTitle(itemName);
            setPrice(itemPrice);
            setItemState(itemCondition);
            setConditionValue(itemCondition);
            setItemSKU('SKU');
            setItemDescription('');
            setImage(itemImage);
        }
    }, [visible, itemName, itemPrice, itemCondition, itemImage]);

    const [itemTitle, setItemTitle] = useState(itemName);
    const [itemState, setItemState] = useState(itemCondition);
    const [itemDescription, setItemDescription] = useState('');
    const [itemSKU, setItemSKU] = useState('SKU');
    const [price, setPrice] = useState(itemPrice);
    const [image, setImage] = useState(itemImage);

    // Dropdown Picker Stuff
    const [conditionOpen, setConditionOpen] = useState(false);
    const [conditionValue, setConditionValue] = useState(itemCondition);

    const cameraRef = useRef<any>(null);
    const [cameraModalOpen, setCameraModalOpen] = useState(false);

    const [boxFocused, setBoxFocused] = useState(false);
    const [descriptionFocused, setDescriptionFocused] = useState(false);
    const [skuFocused, setSkuFocused] = useState(false);
    const [priceFocused, setPriceFocused] = useState(false);
    // const [boxFocused, setBoxFocused] = useState(false);
    // const [boxFocused, setBoxFocused] = useState(false);
    const itemImages: string[] = [];

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            animationType="slide"
        >
            <TouchableWithoutFeedback
                onPress={() => {
                    Keyboard.dismiss(); // dismiss keyboard
                    setConditionOpen(false); // close DropDownPicker
                }}
            >

                <View className="bg-blue-dark-100 flex-1">
                    <KeyboardAvoidingView className="flex-1" behavior="padding">
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Exit Button */}
                            <TouchableOpacity
                                className="self-left px-1 mt-2 ml-2"
                                onPress={() => onClose()}
                            >
                                <Icon name="arrow-circle-o-left" color="orange" size={50} />
                            </TouchableOpacity>


                            <View className="flex-1 justify-start items-center p-4">
                                {/* Title Input */}
                                <View className="w-full max-w-xs mb-4 top-">
                                    <Text className="text-white text-center text-3xl mb-2">TITLE</Text>
                                    <TextInput
                                        placeholder="test"
                                        value={itemTitle}
                                        onChangeText={setItemTitle}
                                        onFocus={() => setBoxFocused(true)}
                                        onBlur={() => setBoxFocused(false)}
                                        onSubmitEditing={() => setBoxFocused(false)}
                                        className={`w-full self-center border-2 text-xs rounded-2xl h-16 ${boxFocused ? "border-blue-500 bg-blue-200" : "border-black bg-gray-400"}`}
                                    />
                                </View>

                                {/* Open Camera on press to changge image */}
                                <TouchableOpacity
                                    className="w-full h-48 m-1 rounded-lg self-center bg-slate-600 pb-6"
                                    onPress={() => setCameraModalOpen(true)}
                                >
                                    <Image
                                        source={{ uri: image }}
                                        className="w-full h-full m-1 rounded-lg self-center bg-slate-600"
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>


                            </View>

                            {/* SKU and Price and Condition */}
                            <View className="flex-row w-full justify-between pt-3 mb-4">
                                {/* SKU */}
                                <View className="flex-1 items-center">
                                    <Text className="text-white text-3xl mb-2">SKU</Text>
                                    <TextInput
                                        placeholder="Enter SKU"
                                        value={itemSKU}
                                        onChangeText={setItemSKU}
                                        onFocus={() => setSkuFocused(true)}
                                        onBlur={() => setSkuFocused(false)}
                                        onSubmitEditing={() => setSkuFocused(false)}
                                        className={`border-2 text-l rounded-2xl h-16 w-3/4 ${skuFocused ? "border-blue-500 bg-blue-200" : "border-black bg-gray-400"}`}
                                    />
                                </View>

                                {/* Price */}
                                <View className="flex-1 items-center">
                                    <Text className="text-white text-3xl mb-2">Price</Text>
                                    <TextInput
                                        placeholder="Enter Price"
                                        value={price}
                                        onChangeText={setPrice}
                                        onFocus={() => setPriceFocused(true)}
                                        onBlur={() => setPriceFocused(false)}
                                        onSubmitEditing={() => setPriceFocused(false)}
                                        className={`border-2 text-l rounded-2xl h-16 w-3/4 ${priceFocused ? "border-blue-500 bg-blue-200" : "border-black bg-gray-400"}`}
                                    />
                                </View>

                                {/*Condition */}
                                <View className="flex-1 items-center">
                                    <Text className="text-white text-3xl text-center mb-2">Condition</Text>
                                    <TouchableOpacity
                                        onPress={() => setConditionOpen(true)}
                                        className={`w-3/4 border-black bg-gray-400 border-2 rounded-2xl`}
                                    >
                                        <Picker
                                            selectedValue={conditionValue}
                                            onValueChange={(itemValue, itemIndex) => {
                                                setConditionValue(itemValue);
                                                setItemState(itemValue);
                                            }}
                                            style={{
                                                backgroundColor: 'transparent',
                                                height: 55,
                                                width: '150%',
                                                paddingLeft: 10,

                                            }}
                                        >
                                            <Picker.Item label="New" value="New" />
                                            <Picker.Item label="Used" value="Used" />
                                            <Picker.Item label="Other" value="Other" />
                                        </Picker>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Description Input */}
                            <View className="flex-1 items-center">
                                <Text className="self-center text-3xl w-1/3 text-white h-16">Description</Text>
                                <TextInput
                                    placeholder="test"
                                    value={itemDescription}
                                    onChangeText={setItemDescription}
                                    onFocus={() => setDescriptionFocused(true)}
                                    onBlur={() => setDescriptionFocused(false)}
                                    onSubmitEditing={() => setDescriptionFocused(false)}
                                    className={`w-full self-center border-2 text-s rounded-2xl h-24 ${descriptionFocused ? "border-blue-500 bg-blue-200" : "border-black bg-gray-400"}`}
                                    multiline={true}
                                    numberOfLines={4}
                                />
                            </View>

                            {/* Submit and Generate Description Buttons */}
                            <View className="flex-row bottom-0 justify-center w-full mb-4">
                                <TouchableOpacity
                                    className="bg-orange-400 rounded-lg border-2 border-black justify-center w-[40%] h-20 mr-2"
                                    onPress={async () => {
                                        let success = uploadDraft(itemTitle, itemDescription, itemCondition, itemPrice, itemSKU, image, "1");
                                        if (await success) {
                                            onClose();
                                        }
                                    }}
                                >
                                    <Text className="text-center text-2xl text-white">Submit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="bg-orange-400 rounded-lg border-2 border-black justify-center w-[40%] h-20 ml-2"
                                    onPress={() => setItemDescription(`${itemState} ${itemTitle} for sale, Contact for more info!`)}
                                >
                                    <Text className="text-center text-xl text-white">Generate Description</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>

                    {/*Camera Modal, I really should just make a premade component with the takepicture but whatever, next time, sphagetti cant be sorted now*/}
                    <Modal visible={cameraModalOpen} onRequestClose={() => setCameraModalOpen(false)} animationType="slide">
                        <CameraView
                            ref={cameraRef}
                            style={{ flex: 1 }}
                            facing={"back"}
                            mode="picture"
                            mute={true}
                            animateShutter={false}
                        >
                            <View className="flex-1">
                                <TouchableOpacity
                                    className="self-left px-1 mt-2 ml-2"
                                    onPress={() => setCameraModalOpen(false)}
                                >
                                    <Icon name="arrow-circle-o-left" color="orange" size={50} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={async () => {
                                        let newImageURI = await takePicture(cameraRef.current);
                                        setImage(newImageURI);
                                        setCameraModalOpen(false);
                                    }}
                                    style={{ borderRadius: 999, borderWidth: 8, borderColor: 'white', position: 'absolute', bottom: 80, width: 96, height: 96, alignSelf: 'center' }}
                                >
                                </TouchableOpacity>
                            </View>

                        </CameraView>
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        </Modal >
    )
}


export default UploadDraftModal