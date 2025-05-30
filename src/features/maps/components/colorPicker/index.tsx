import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Modal from 'react-native-modal';
import ColorPicker, {
  Panel1,
  Preview,
  HueSlider,
} from 'reanimated-color-picker';
import { Props } from './types';

const CustomColorPicker = ({
  title,
  selectedItem,
  onSelectColor,
  onCancel,
  visible,
}: Props) => {
  // Track the temporary color selection
  const [tempColor, setTempColor] = useState<string>(selectedItem || '#ffffff');

  // Update tempColor when selectedItem changes or when modal becomes visible
  useEffect(() => {
    if (visible) {
      setTempColor(selectedItem || '#ffffff');
    }
  }, [selectedItem, visible]);

  const onColorChange = ({ hex }: { hex: string }) => {
    // Just update the temporary color without selecting it
    setTempColor(hex);
  };

  const handleApply = () => {
    // Apply the color only when the Apply button is clicked
    onSelectColor(tempColor);
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onCancel}
      onBackButtonPress={onCancel}
      onSwipeComplete={onCancel}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      <SafeAreaView style={styles.modalContent}>
        <View style={styles.colorPickerContainer}>
          <Text style={styles.colorPickerTitle}>{title}</Text>

          <ColorPicker
            value={selectedItem || '#ffffff'}
            onCompleteJS={onColorChange}
            style={styles.colorPickerMain}>
            <Preview
              style={styles.previewContainer}
              hideInitialColor
              hideText
            />
            <Panel1 style={styles.panelStyle} />
            <HueSlider style={styles.sliderStyle} />
          </ColorPicker>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  colorPickerContainer: {
    backgroundColor: 'white',
    padding: 16,
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  colorPickerMain: {
    width: '100%',
    paddingBottom: 20,
  },
  previewContainer: {
    marginBottom: 20,
    height: 60,
    width: '80%',
    alignSelf: 'center',
  },
  panelStyle: {
    borderRadius: 16,
    marginBottom: 16,
  },
  sliderStyle: {
    borderRadius: 10,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CustomColorPicker;
