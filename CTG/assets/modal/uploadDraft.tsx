import { uploadDraft } from "@/ebayApi";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Text, TouchableOpacity, View, Image } from "react-native"
import { TextInput } from "react-native-gesture-handler";
import { withReanimatedTimer } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/FontAwesome'



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


const UploadDraftModal = ({ visible, onClose, itemName, itemPrice, itemCondition, itemImage }: UploadDraftModalProps) => {
    const [itemTitle, setItemTitle] = useState(itemName);
    const [itemState, setItemState] = useState(itemCondition);
    const [itemDescription, setItemDescription] = useState('hello');
    const [itemSKU, setItemSKU] = useState('SKU');
    const [price, setPrice] = useState(itemPrice);

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
            <SafeAreaView className="bg-blue-dark-100 flex-1">
                <KeyboardAvoidingView className="flex-1" behavior="padding">
                    {/* Exit Button */}
                    <TouchableOpacity
                        className="self-left px-1 mt-2 ml-2"
                        onPress={() => onClose()}
                    >
                        <Icon name="arrow-circle-o-left" color="orange" size={50} />
                    </TouchableOpacity>


                    <View className="flex-1 justify-start items-center p-4">
                        {/* Title Input */}
                        <View className="w-full max-w-xs mb-4">
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
                        <TouchableOpacity className="w-1/2 h-32 m-1 rounded-lg self-center bg-slate-600">
                            <Image
                                source={{ uri: itemImage }}
                                className="w-full h-full m-1 rounded-lg self-center bg-slate-600"
                                resizeMode="contain"
                            />
                        </TouchableOpacity>

                        {/* Description Input */}
                        <View className="w-full max-w-xs mb-4">
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

                        {/* SKU and Price */}
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
                                    className={`border-2 text-l rounded-2xl h-12 w-3/4 ${skuFocused ? "border-blue-500 bg-blue-200" : "border-black bg-gray-400"}`}
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
                                    className={`border-2 text-l rounded-2xl h-12 w-3/4 ${priceFocused ? "border-blue-500 bg-blue-200" : "border-black bg-gray-400"}`}
                                />
                            </View>
                        </View>

                        {/* Submit and Generate Description Buttons */}
                        <View className="mb-4">
                            <TouchableOpacity
                                className="bg-black py-2 px-4 mb-2"
                                onPress={() => uploadDraft(itemName, "test", itemCondition, itemPrice, "test1", ["https://i.ebayimg.com/images/g/BHAAAOSw-oFkTLL9/s-l225.jpg"], "1")}
                            >
                                <Text className="text-white text-center">Submit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-black py-2 px-4"
                                onPress={() => setItemDescription(`${itemCondition} ${itemName} for sale, Contact for more info!`)}
                            >
                                <Text className="text-white text-center">Generate Description</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    )
}


export default UploadDraftModal