import React, { useState, useRef } from 'react';
import { View, PanResponder, StyleSheet, Text } from 'react-native';

export function SizeSlider({ value, min = 3, max = 20, onChange }) {
  const [sliderWidth, setSliderWidth] = useState(200);
  const trackRef = useRef(null);

  const handleTouch = (evt) => {
    const touchX = evt.nativeEvent.locationX;
    // Mapea la posición táctil al rango de valores (min - max)
    const clampedX = Math.max(0, Math.min(touchX, sliderWidth));
    const newValue = Math.round(min + (clampedX / sliderWidth) * (max - min));
    onChange(newValue);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleTouch(evt),
      onPanResponderMove: (evt) => handleTouch(evt),
    })
  ).current;

  // Calcula la posición horizontal del círculo selector
  const knobPosition = ((value - min) / (max - min)) * sliderWidth;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Grosor: {value}px</Text>
      <View
        style={styles.trackContainer}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        {/* Barra de fondo */}
        <View style={styles.track} />
        {/* Círculo selector */}
        <View style={[styles.knob, { transform: [{ translateX: knobPosition }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  trackContainer: {
    height: 30,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    backgroundColor: '#ddd',
    borderRadius: 3,
  },
  knob: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    marginLeft: -10, // Centra el círculo sobre la coordenada
  },
});