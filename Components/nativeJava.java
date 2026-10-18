package com.anon.canvasLienzo; // Asegúrate de que coincida con tu package name

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;

public class BluetoothNetworkModule {

    public static String getBluetoothTetheringIP() {
        try {
            // Obtenemos todas las interfaces de red del dispositivo (Wi-Fi, Datos, BT, etc.)
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            
            for (NetworkInterface intf : interfaces) {
                // Buscamos la interfaz "bt-pan" (Bluetooth Personal Area Network)
                if (intf.getName().toLowerCase().contains("bt-pan")) {
                    List<InetAddress> addrs = Collections.list(intf.getInetAddresses());
                    for (InetAddress addr : addrs) {
                        // Nos aseguramos de obtener la dirección IPv4 y no la IPv6
                        if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                            return addr.getHostAddress(); // Retorna ej: "192.168.44.15"
                        }
                    }
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return "No detectada";
    }
}