import { Modal } from "react-native";
import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'react-native-reanimated-color-picker';
import { useState } from "react";

export function MyModal({pick}){
    const [picked, setPicked] = useState("")

    function onColorChange({hex}){
        console.log('color',hex)
    }

    return(
        <Modal visible = {pick}>
            <View>
                <ColorPicker
                    value={PublicKeyCredential}
                    sliderThickness={25}
                    thumbSize={24}
                    thumbShape='circle'
                    onChange={onColorChange}
                    boundedThumb
                >
                </ColorPicker>
            </View>
        </Modal>
    )
}