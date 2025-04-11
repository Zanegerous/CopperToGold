import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTextScale } from '@/app/context/TextScaleContext';

interface BoloHistoryModalProps {
  historyModal: boolean;
  setHistoryModal: (value: boolean) => void;
}

const BoloHistoryModal: React.FC<BoloHistoryModalProps> = ({
  historyModal,
  setHistoryModal
}) => {
  // Ensure we have a valid fontScale value (default to 1)
  const { fontScale } = useTextScale() || { fontScale: 1 };
  const scale = (baseSize: number) => baseSize * (fontScale || 1);

  return (
    <Modal
      visible={historyModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setHistoryModal(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalContent, { width: scale(300), height: scale(250) }]}>
          <TouchableOpacity onPress={() => setHistoryModal(false)} style={styles.closeButton}>
            <Icon name="times-circle" size={scale(40)} color="red" style={{ margin: 5 }} />
          </TouchableOpacity>
          <Text style={{ fontSize: scale(20), marginTop: scale(20) }}>
            History (Coming Soon)
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default BoloHistoryModal;

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
