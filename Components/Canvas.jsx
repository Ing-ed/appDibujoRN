import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal, NativeModules, Alert } from "react-native";
import { Button } from "./Button";
import { Svg, Path } from "react-native-svg";
import { ColorPicker } from "./ColorPicker";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from 'expo-sharing'
//network
import dgram from 'react-native-udp';
import * as Network from 'expo-network'
import { Buffer } from "buffer";
import { NetworkInfo } from "react-native-network-info";


export function Canvas() {
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [pick, setPick] = useState(false);
    const [color, setColor] = useState("#000000");
    const [options, setOptions] = useState(false);

    //
    const [buscando, setBuscando] = useState(false)
    const [serverIp, setServerIp] = useState('desconocida')

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
            setPaths((prevPaths) => [...prevPaths, { d: currentPath.join(" "), color: color }]);
            setCurrentPath([]);
        }
    }


    function handleClearButton() {
        setPaths([]);
        setCurrentPath([]);
    }

    function ColorSelected() {
        setPick(false)
    }

    async function SendSign(){
        try{
            const uri = await captureRef(viewShotRef,{
                format: 'png',
                quality: 1,
                result: 'data-uri',
            });
            const formData = new FormData();
            formData.append('imageData',uri);
            formData.append('imageSign','usuario');
            
            const targetUrl = `http://${serverIp}/upload`
            console.log("enviando a: ", targetUrl)
            const resp = await fetch(targetUrl,{
                method:'POST',
                body:formData,
            });
            console.log("Enviando")
            if(resp.ok){
                Alert.alert('Éxito', 'La firma está guardada correctamente');
            } else {
                Alert.alert('Error','Ocurrio un error');
            }
        } catch(err){
            Alert.alert("Error: ", err.toString());
        }
    }

    const { BluetoothModule } = NativeModules;
    async function FindSignServer() {
        try {
            // 1. Obtenemos la IP de tu celular mediante tu módulo Java nativo ("10.244.48.136")
            let miIp = await BluetoothModule.getBluetoothIP();
            const ipWF = await Network.getIpAddressAsync();
            if (!miIp || miIp === "No detectada") {
                console.log("Error:Bt no activo", "la ip que se va a usar:", ipWF)
                miIp = ipWF
                // setServerIp('Error: Bluetooth Tethering inactivo');
                // setBuscando(false);
                // return;
            }

            // 2. Extraemos los primeros 3 octetos ("10.244.48")
            const octetos = miIp.split('.');
            console.log("la ip que se usa", miIp)
            const baseSubred = `${octetos[0]}.${octetos[1]}.${octetos[2]}.255`;

            const socket = dgram.createSocket({ type: 'udp4' });
            socket.bind(0);

            socket.on('message', (msg, rinfo) => {
                const resp = msg.toString();
                if (resp === "AQUI_ESTA_EL_SERVIDOR") {
                    console.log("Encontrado el server", rinfo.address);
                    setServerIp(rinfo.address);
                    SendSign();
                }
            })
            // 
            console.log("enviando broadcast a ", baseSubred)
            socket.once('listening', () => {
                const mensaje = Buffer.from('BUSCAR_SERVIDOR_CANVAS');
                socket.send(mensaje, 0, mensaje.length, 5005, baseSubred, (err) => {
                    if (err) console.log("Error:", err);
                })
            })
            setTimeout(() => {
                try { socket.close(); } catch (e) { }
                setBuscando(false);
            }, 3000);
        } catch (error) {
            console.error("Error en el escaneo:", error);
            setServerIp('Error al escanear');
        } finally {
            setBuscando(false);
        }
    };

    async function handleShare() {
        try {
            if (!viewShotRef.current) return;
            //catpura del canvas
            const uri = await viewShotRef.current.capture();
            const availableShare = await Sharing.isAvailableAsync();
            if (!availableShare) {
                Alert.alert("Error", "No se puede compartir");
                return;
            }
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: "Compartir",
                UTI: 'imagen.png'
            })
        } catch (error) {
            console.log("Error al exportar")
        }
    }

    async function handleCapture() {
        console.log("Guardar")
        try {
            if (!viewShotRef.current) return;
            //catpura del canvas
            const uri = await viewShotRef.current.capture();
            console.log(`Guardado como ${uri}`)
            return uri;
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }

    return (
        <View style={styles.container}>
            <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 1.0, result: "tmpfile" }}
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
                <Button text={"Color"} onPress={() => setPick(true)} />
                <Button text={"Guardar"} onPress={handleShare} />
                <Button text={"VerIp"} onPress={FindSignServer} />
            </View>
            {pick ?
                <ColorPicker visible={pick} onClose={ColorSelected} onSelectColor={(color) => setColor(color)} /> : <></>
            }
            <Modal visible={options}>
                <View>
                    <Text>Guardar?</Text>
                </View>
                <View>
                    <Button text={"Guardar"} onPress={() => console.log("Guardar")} />
                    <Button text={"Cancelar"} onPress={() => setOptions(false)} />
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
        backgroundColor: "transparent",
    },
    clearButton: {
        padding: 15,
        backgroundColor: "#eee",
        alignItems: "center",
    },
});