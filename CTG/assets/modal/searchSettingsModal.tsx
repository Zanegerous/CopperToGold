import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTextScale } from '@/app/context/TextScaleContext';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/app/context/ThemeContext';

interface SearchSettingsModalProps {
  settingModal: boolean;
  setSettingModal: (value: boolean) => void;
  viewSoldItemSetting: boolean;
  toggleViewSoldItemSetting: (value: boolean) => void;
  auctionSetting: boolean;
  toggleAuctionSetting: (value: boolean) => void;
  itemCondition: string;
  setItemCondition: (value: string) => void;
  minMaxSetting: boolean;
  toggleMinMaxSetting: (value: boolean) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
}

const SearchSettingsModal: React.FC<SearchSettingsModalProps> = ({
  settingModal,
  setSettingModal,
  viewSoldItemSetting,
  toggleViewSoldItemSetting,
  auctionSetting,
  toggleAuctionSetting,
  itemCondition,
  setItemCondition,
  minMaxSetting,
  toggleMinMaxSetting,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}) => {
  const { fontScale } = useTextScale();
  const scale = (baseSize: number) => baseSize * fontScale;
  const { isDarkMode } = useTheme();


  const itemConditionOptions = [
    { label: 'All', value: 'all' },
    { label: 'New', value: '1000' },
    { label: 'Used', value: '3000' },
    { label: 'Parts or Not Working', value: '7000' },
  ];

  // Styling Simplification
  const switchProps = {
    trackColor: { false: "#767577", true: "#81b0ff" },
    thumbColor: "#e28743",
  };
  const settingWrapper = `flex-row items-center justify-between w-11/12 max-w-md h-14 px-4 self-center rounded-lg border-2 mt-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-dark-200 border-blue-300'}`;
  const buttonText = `text-base font-medium ${isDarkMode ? 'text-white' : 'text-white'}`;
  const switchWrapper = `w-36 h-12 flex-row items-center justify-center p-2 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-500' : 'bg-white border-gray-300'}`;


  return (
    <Modal visible={settingModal} transparent={true} animationType={'fade'} onRequestClose={() => { setSettingModal(false) }}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className={`w-full border-4 rounded-2xl p-4 max-h-[90%] ${isDarkMode ? 'bg-gray-800' : 'bg-slate-600'}`}>

          <TouchableOpacity onPress={() => setSettingModal(false)} className="w-12">
            <Icon name="times-circle" size={40} color="red" className="m-1" />
          </TouchableOpacity>

          <Text className="align-middle text-center font-semibold text-4xl text-white" style={{ fontSize: scale(32) }}>
            Search Settings
          </Text>


          <View className={settingWrapper}>
            <Text style={{ fontSize: scale(16) }} className={buttonText}>
              View Only Sold Items
            </Text>
            <View className={switchWrapper}>
              <Switch
                value={viewSoldItemSetting}
                onValueChange={toggleViewSoldItemSetting}
                {...switchProps}
              />
            </View>
          </View>

          <View className={settingWrapper}>
            <Text style={{ fontSize: scale(16) }} className={buttonText}>
              Include Auction Listings
            </Text>
            <View className={switchWrapper}>
              <Switch
                value={auctionSetting}
                onValueChange={toggleAuctionSetting}
                {...switchProps}
              />
            </View>
          </View>

          {/* Item Condition Dropdown */}
          <View className={settingWrapper}>
            <Text style={{ fontSize: scale(16) }} className={buttonText}>
              Item Condition: {
                itemCondition === 'all' ? 'All' :
                  itemCondition === '1000' ? 'New' :
                    itemCondition === '3000' ? 'Used' :
                      itemCondition === '7000' ? 'Parts' : 'All'
              }
            </Text>
            <Picker
              selectedValue={itemCondition}
              onValueChange={(value) => setItemCondition(value)}
              style={{
                height: 40,
                width: '20%',
                backgroundColor: '#fff',
                borderRadius: 5,
                textAlign: 'center',
              }}
            >
              {itemConditionOptions.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>

          <View className={settingWrapper}>
            <Text style={{ fontSize: scale(16) }} className={buttonText}>
              Set Min/Max Price
            </Text>
            <View className={switchWrapper}>
              <Switch
                value={minMaxSetting}
                onValueChange={toggleMinMaxSetting}
                {...switchProps}
              />
            </View>
          </View>


          {minMaxSetting && (<View className="w-72 mt-6 self-center">
            <Text className="text-white text-center mb-2">
              Price Range: ${minPrice} - ${maxPrice}
            </Text>

            <MultiSlider
              values={[parseInt(minPrice), parseInt(maxPrice)]}
              min={0}
              max={1000}
              step={10}
              sliderLength={200}  // Adjusted slider length
              onValuesChange={(values) => {
                setMinPrice(String(values[0]));
                setMaxPrice(String(values[1]));
              }}

              selectedStyle={{
                backgroundColor: 'grey',
              }}

              unselectedStyle={{
                backgroundColor: 'white',
              }}
              containerStyle={{
                alignSelf: 'center',
                marginVertical: 20,  // Adds vertical spacing
              }}
              trackStyle={{
                height: 6,
                borderRadius: 3,  // Rounded track edges
              }}

              markerStyle={{
                backgroundColor: 'black',
                height: 24,
                width: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: 'white',
                marginTop: 4,
              }}
            />
          </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SearchSettingsModal;
