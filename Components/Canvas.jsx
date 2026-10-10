import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Button } from "./Button";
import { Svg, Path } from "react-native-svg";
import { ColorPicker } from "./ColorPicker";
// import { MyModal } from "./MyModal";

export function Canvas() {
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [pick, setPick] = useState(false);
    const [color, setColor] = useState("#000000");
    const [options, setOptions] = useState(false);

    function handleTouchMove(event) {
        const { locationX, locationY } = event.nativeEvent;
        const prefix = currentPath.length === 0 ? "M" : "L";
        const newPoint = `${prefix}${locationX.toFixed(0)},${locationY.toFixed(0)}`;

        setCurrentPath((prev) => [...prev, newPoint]);
    }

    function handleTouchEnd() {
    if (currentPath.length > 0) {
      // Guardamos el trazo junto con su color
      setPaths((prevPaths) => [
        ...prevPaths,
        { d: currentPath.join(" "), color: color },
      ]);
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

    return (
        <View style={styles.container}>
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
            <Button text={"Clear"} onPress={handleClearButton} />
            <Button text={"Color"} onPress={()=>setPick(true)}/>
            <Button text={"Options"} onPress={()=>setOptions(true)}/>
            {pick ?
                <ColorPicker visible={pick} onClose={ColorSelected} onSelectColor={(color)=>setColor(color)}/>:<></>
            }
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