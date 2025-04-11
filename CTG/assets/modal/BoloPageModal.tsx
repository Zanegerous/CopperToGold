import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTextScale } from '@/app/context/TextScaleContext';

interface BoloPageModalProps {
  settingModal: boolean;
  setSettingModal: (value: boolean) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string) => void;
  categories: { label: string; value: string }[];
}

const BoloPageModal: React.FC<BoloPageModalProps> = ({
  settingModal,
  setSettingModal,
  selectedCategory,
  setSelectedCategory,
  categories,
}) => {
  const { fontScale } = useTextScale();
  const scale = (baseSize: number) => baseSize * fontScale;

  const [open, setOpen] = useState(false);

  return (
    <Modal
      visible={settingModal}
      transparent={true}
      animationType={'fade'}
      onRequestClose={() => setSettingModal(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalContent, { width: scale(300), height: scale(250) }]}>
          <TouchableOpacity onPress={() => setSettingModal(false)} style={styles.closeButton}>
            <Icon name="times-circle" size={scale(40)} color="red" style={{ margin: 5 }} />
          </TouchableOpacity>
          <DropDownPicker
            open={open}
            value={selectedCategory}
            items={categories}
            setOpen={setOpen}
            setValue={setSelectedCategory}
            placeholder="Select Category"
            containerStyle={{ width: "80%" }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default BoloPageModal;
