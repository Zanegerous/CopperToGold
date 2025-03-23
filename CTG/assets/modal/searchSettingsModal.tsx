import React from 'react';
import { Modal, View, Text, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTextScale } from '@/app/context/TextScaleContext';


interface SearchSettingsModalProps {
  settingModal: boolean;
  setSettingModal: (value: boolean) => void;
  auctionSetting: boolean;
  toggleAuctionSetting: (value: boolean) => void;
  usedItemSetting: boolean;
  toggleUsedItemSetting: (value: boolean) => void;
}

const SearchSettingsModal: React.FC<SearchSettingsModalProps> = ({
  settingModal,
  setSettingModal,
  auctionSetting,
  toggleAuctionSetting,
  usedItemSetting,
  toggleUsedItemSetting,
}) => {
  const { fontScale } = useTextScale();
  const scale = (baseSize: number) => baseSize * fontScale;
  return (
    <Modal visible={settingModal} transparent={true} animationType={'fade'} onRequestClose={() => { setSettingModal(false) }}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-96 h-96 bg-slate-600 border-4 rounded-2xl">
          <TouchableOpacity onPress={() => setSettingModal(false)} className="w-12">
            <Icon name="times-circle" size={40} color="red" className="m-1" />
          </TouchableOpacity>
          <Text className="align-middle text-center font-semibold text-4xl text-white" style={{ fontSize: scale(32) }}>
            Search Settings
          </Text>
          <View className="w-36 h-12 bg-white flex-row items-center justify-between p-2 mt-6 rounded-lg self-center border-2">
            <Text style={{ fontSize: scale(16) }} className="text-m">
              Auctions
            </Text>
            <Switch
              value={auctionSetting}
              onValueChange={toggleAuctionSetting}
              trackColor={{ true: "#767577", false: "#81b0ff" }}
              thumbColor={"#f5dd4b"}
            />
          </View>

          <View className="w-36 h-12 bg-white flex-row items-center justify-between p-2 mt-4 rounded-lg self-center border-2">
            {usedItemSetting ? (<Text className="text-lg">Used</Text>) : (<Text className="text-lg">New</Text>)}
            <Switch
              value={usedItemSetting}
              onValueChange={toggleUsedItemSetting}
              trackColor={{ true: "#767577", false: "#81b0ff" }}
              thumbColor={"#f5dd4b"}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SearchSettingsModal;
