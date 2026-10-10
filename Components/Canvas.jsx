import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal } from "react-native";
import { Button } from "./Button";
import { Svg, Path } from "react-native-svg";
import { ColorPicker } from "./ColorPicker";
import ViewShot from "react-native-view-shot";
import * as Sharing from 'expo-sharing'
import * as Network from 'expo-network'

export function Canvas() {
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [pick, setPick] = useState(false);
    const [color, setColor] = useState("#000000");
    const [options, setOptions] = useState(false);

    const viewShotRef = useRef(null);

    // const [status, requestPermission] = MediaLibrary.usePermissions();

    function handleTouchMove(event) {
        const { locationX, locationY } = event.nativeEvent;
        const prefix = currentPath.length === 0 ? "M" : "L";
        const newPoint = `${prefix}${locationX.toFixed(0)},${locationY.toFixed(0)}`;

        setCurrentPath((prev) => [...prev, newPoint]);
    }

    function handleTouchEnd() {
        if (currentPath.length > 0) {
        setPaths((prevPaths) => [...prevPaths,{ d: currentPath.join(" "), color: color }]);
        setCurrentPath([]);
        }
    }

    
    function handleClearButton() {
        setPaths([]);
        setCurrentPath([]);
    }
    
    function ColorSelected(){
        setPick(false)
    }
    
    async function FindSignServer(){
        const ip = await Network.getIpAddressAsync();
        console.log(ip);
    }

    async function handleShare(){
        try{
             if(!viewShotRef.current) return;
            //catpura del canvas
            const uri = await viewShotRef.current.capture();
            const availableShare = await Sharing.isAvailableAsync();
            if(!availableShare){
                Alert.alert("Error","No se puede compartir");
                return;
            }
            await Sharing.shareAsync(uri,{
                mimeType:'image/png',
                dialogTitle:"Compartir",
                UTI:'imagen.png'
            })
        } catch(error){
            console.log("Error al exportar")
        }
    }

    async function handleCapture(){
        console.log("Guardar")
        try{
            if(!viewShotRef.current) return;
            //catpura del canvas
            const uri = await viewShotRef.current.capture();
            console.log(`Guardado como ${uri}`)
            return uri;
        } catch(error){
            console.log(`Error: ${error}`);
        }
    }

    return (
        <View style={styles.container}>
            <ViewShot
                ref={viewShotRef}
                options={{format:"png", quality: 1.0,result:"tmpfile"}}
                style={styles.svgContainer}>
            <View
                style={styles.svgContainer}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                >
                <Svg style={StyleSheet.absoluteFill}>
                    {paths.map((item, index) => (
                        <Path
                        key={`path-${index}`}
                        d={item.d}
                        stroke={item.color}
                        fill="transparent"
                        strokeWidth={3}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        />
                    ))}

                    {currentPath.length > 0 && (
                        <Path
                        d={currentPath.join(" ")}
                        stroke={color}
                        fill="transparent"
                        strokeWidth={3}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        />
                    )}
                </Svg>
            </View>
            </ViewShot>
            <View>
                <Button text={"Clear"} onPress={handleClearButton} />
                <Button text={"Color"} onPress={()=>setPick(true)}/>
                <Button text={"Guardar"} onPress={handleShare}/>
                <Button text={"VerIp"} onPress={FindSignServer}/>
            </View>
            {pick ?
                <ColorPicker visible={pick} onClose={ColorSelected} onSelectColor={(color)=>setColor(color)}/>:<></>
            }
            <Modal visible={options}>
                <View>
                    <Text>Guardar?</Text>
                </View>
                <View>
                    <Button text={"Guardar"} onPress={()=>console.log("Guardar")}/>
                    <Button text={"Cancelar"} onPress={()=>setOptions(false)}/>
                </View>
            </Modal>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
    },
    svgContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    clearButton: {
        padding: 15,
        backgroundColor: "#eee",
        alignItems: "center",
    },
});