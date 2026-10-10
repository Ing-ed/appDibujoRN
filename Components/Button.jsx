import { TouchableOpacity, Text } from "react-native"
export function Button({text, onPress}){
    return(
        <TouchableOpacity style={{padding: 15,backgroundColor: "#eee",alignItems: "center"}} onPress={onPress}>
            <Text>{text}</Text>
        </TouchableOpacity>
    )

}