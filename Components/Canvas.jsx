import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal, NativeModules } from "react-native";
import { Button } from "./Button";
import { Svg, Path } from "react-native-svg";
import { ColorPicker } from "./ColorPicker";
import ViewShot from "react-native-view-shot";
import * as Sharing from 'expo-sharing'
//network
import dgram from 'react-native-udp';
import * as Network from 'expo-network'
import { NetworkInfo } from "react-native-network-info";


export function Canvas() {
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [pick, setPick] = useState(false);
    const [color, setColor] = useState("#000000");
    const [options, setOptions] = useState(false);

    //
    const [buscando,setBuscando] = useState(false)
    
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
    
    const {BluetoothModule} = NativeModules;
    async function FindSignServer(){
        try {
            // 1. Obtenemos la IP de tu celular mediante tu módulo Java nativo ("10.244.48.136")
            const miIp = await BluetoothModule.getBluetoothIP(); 
            
            if (!miIp || miIp === "No detectada") {
                setServerIp('Error: Bluetooth Tethering inactivo');
                setBuscando(false);
                return;
            }

            // 2. Extraemos los primeros 3 octetos ("10.244.48")
            const octetos = miIp.split('.');
            const baseSubred = `${octetos[0]}.${octetos[1]}.${octetos[2]}`;

            // 3. Creamos una lista de IPs sospechosas (del .240 al .254, donde Android asigna las PCs)
            const ipsAProbar = [];
            for (let i = 254; i >= 240; i--) {
                ipsAProbar.push(`${baseSubred}.${i}`);
            }
            
            // Agregamos también los rangos bajos típicos por si acaso (.1, .2)
            ipsAProbar.push(`${baseSubred}.1`);
            ipsAProbar.push(`${baseSubred}.2`);

            console.log(`Lanzando escaneo veloz a ${ipsAProbar.length} IPs...`);
            const puertoServidor = 8080; // Puerto HTTP de tu Flask

            // 4. Ejecutamos las peticiones HTTP en paralelo con un tiempo de espera muy corto (1.2 segundos)
            const promesas = ipsAProbar.map(async (ip) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1200);

                try {
                // Intentamos golpear la raíz de tu servidor Flask
                const respuesta = await fetch(`http://${ip}:${puertoServidor}/`, {
                    method: 'GET',
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                // Si el servidor Flask nos responde cualquier cosa, la IP es correcta
                if (respuesta.status === 200) {
                    return { ip, exito: true };
                }
                return { ip, exito: false };
                } catch (err) {
                clearTimeout(timeoutId);
                return { ip, exito: false };
                }
            });

            // 5. Procesamos todas las respuestas en paralelo
            const resultados = await Promise.all(promesas);
            const servidorEncontrado = resultados.find(r => r.exito);

            if (servidorEncontrado) {
                console.log(`¡Servidor Flask autodetectado en la IP: ${servidorEncontrado.ip}!`);
                setServerIp(servidorEncontrado.ip); // Guardará "10.244.48.244" automáticamente
            } else {
                setServerIp('No encontrado');
                console.log("Ninguna IP del segmento respondió en el puerto 8080.");
            }

            } catch (error) {
            console.error("Error en el escaneo:", error);
            setServerIp('Error al escanear');
            } finally {
            setBuscando(false);
            }
    };

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