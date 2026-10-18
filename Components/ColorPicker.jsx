import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import {SizeSlider} from './SizeSlider'
const PALETTE = [
  '#000000', // Negro
  '#FF0000', // Rojo
  '#00FF00', // Verde
  '#0000FF', // Azul
  '#FFFF00', // Amarillo
  '#FF00FF', // Magenta
  '#00FFFF', // Cian
  '#FFA500', // Naranja
  '#FF00A5', // Fuccia
  '#00FFA5', // Turquesa
  '#00A5FF', // Celeste
  '#A500FF', // Violeta
  '#8B4513', // Marrón
];

export function ColorPicker({ visible, currentColor, onSelectColor, onClose, wValue,wOnChange }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Selecciona un color</Text>
          
          <View style={styles.paletteContainer}>
            {PALETTE.map((color) => {
              const isSelected = color === currentColor;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    isSelected && styles.selectedCircle,
                  ]}
                  onPress={() => {
                    onSelectColor(color);
                    // onClose();
                  }}
                />
              );
            })}
          </View>
          <SizeSlider value={wValue} onChange={wOnChange}/>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  paletteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#fff',
  },
  selectedCircle: {
    borderWidth: 3,
    borderColor: '#000',
    transform: [{ scale: 1.1 }],
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 14,
    color: '#333',
  },
});