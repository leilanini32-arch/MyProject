import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";

type SNDetail = {
    fxh: string;
    sn: string;
    imeiCode1: string;
    imeiCode2: string;
    imeiCode3: string;
    realdate: string;
    orderCode: string;
    model: string;
    color: string;
    palletCode: string;
    boxCode: string;
};



export default function DeliverySNConfirm({ navigation, route }: any) {
    const { gsURL, setgs_gsURL } = useGlobal();
    const BASE_URL = gsURL;
    const { fromWareHouseCode, palletCode: initialPalletCode, boxCode: initialBoxCode, SN, scanType, showConfirm, onConfirm } = route.params || {};
    const global = useGlobal();

    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<SNDetail[]>([]);
    const [palletCode, setPalletCode] = useState(initialPalletCode || "");
    const [boxCode, setBoxCode] = useState(initialBoxCode || "");
    const [model, setModel] = useState("");
    const [color, setColor] = useState("");
    const [title, setTitle] = useState("");

    useEffect(() => {
        fetchSNDetails();
    }, []);

    const fetchSNDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/DeliveryPalletSNConfirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    FactoryCode: global.gs_factoryCode,
                    FromWareHouseCode:fromWareHouseCode,
                    PalletCode: initialPalletCode,
                    BoxCode: initialBoxCode,
                    SN:SN,
                    ScanType:scanType
                })
            });

            const result = await response.json();
            console.log("message6", result);
            if (result.message == "success" && result.data && result.data.length > 0) {
                const list: SNDetail[] = result.data.map((item: any) => ({
                    fxh: item.fxh,
                    sn: item.sn,
                    imeiCode1: item.imeiCode1,
                    imeiCode2: item.imeiCode2,
                    imeiCode3: item.imeiCode3,
                    realdate: item.realDate,
                    orderCode: item.orderCode,
                    model: item.model,
                    color: item.color,
                    palletCode: item.palletCode,
                    boxCode: item.boxCode
                }));

                setDetails(list);

                // Update pallet/box if scanType is sn
                if (scanType === "sn") {
                    setPalletCode(list[0].palletCode);
                    setBoxCode(list[0].boxCode);
                }

                setModel(list[0].model);
                setColor(list[0].color);

                const baseTitle = scanType === "sn" ? `SN: ${SN}` : `Pallet: ${list[0].palletCode} Box: ${list[0].boxCode}`;
                setTitle(`${baseTitle} ${list[0].model} ${list[0].color}`);
            } else {
                Alert.alert("Error", result.message || "There is no product in the Pallet!");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch SN details");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (details.length >= 1) {
            if (onConfirm) onConfirm();
            navigation.goBack();
        } else {
            Alert.alert("Warning", "No data to confirm.");
            navigation.goBack();
        }
    };

    const handleExit = () => {
        navigation.goBack();
    };

    const tableHeaders = ["FXH", "SN", "IMEI 1", "IMEI 2", "IMEI 3", "Date", "Order"];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>SN Details Confirmation</Text>
                    {loading && <ActivityIndicator color="#FFF" />}
                </View>
                <Text style={styles.headerSubtitle}>{title || "Loading..."}</Text>
                <Text style={styles.headerSubtitle}>Total qty: {details.length}</Text>
            </View>

            <View style={styles.container}>
                {/* List Card */}
                <View style={[styles.card, { flex: 1 }]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>SN List</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View>
                            <View style={styles.tableHeaderRow}>
                                {tableHeaders.map((h) => (
                                    <Text key={h} style={styles.headerCell}>
                                        {h}
                                    </Text>
                                ))}
                            </View>

                            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator>
                                {details.length > 0 ? (
                                    details.map((item, index) => (
                                        <View key={index} style={styles.tableDataRow}>
                                            <Text style={styles.cell}>{item.fxh}</Text>
                                            <Text style={styles.cell}>{item.sn}</Text>
                                            <Text style={styles.cell}>{item.imeiCode1}</Text>
                                            <Text style={styles.cell}>{item.imeiCode2}</Text>
                                            <Text style={styles.cell}>{item.imeiCode3}</Text>
                                            <Text style={styles.cell}>{item.realdate}</Text>
                                            <Text style={styles.cell}>{item.orderCode}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>No data available</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>

                {/* Actions */}
                <View style={styles.actionContainer}>
                    {showConfirm && (
                        <TouchableOpacity
                            style={[styles.btn, styles.btnPrimary]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.btnText}>Confirm</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.btn, styles.btnSecondary]}
                        onPress={handleExit}
                    >
                        <Text style={styles.btnTextSecondary}>Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
    container: { flex: 1, padding: 16, paddingBottom: 40 },
    header: {
        backgroundColor: "#1E1B4B",
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
    headerSubtitle: { color: "#A5B4FC", fontSize: 13, fontWeight: "600", marginTop: 4 },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: { borderLeftWidth: 4, borderLeftColor: "#4F46E5", paddingLeft: 10, marginBottom: 20 },
    cardTitle: { fontSize: 14, fontWeight: "800", color: "#475569", textTransform: "uppercase" },
    tableHeaderRow: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 8, paddingVertical: 10 },
    headerCell: { width: 100, textAlign: "center", fontSize: 10, fontWeight: "800", color: "#64748B", textTransform: "uppercase" },
    tableDataRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    cell: { width: 100, textAlign: "center", paddingVertical: 15, fontSize: 11, color: "#334155", fontWeight: "600" },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40, width: 700 },
    emptyText: { color: "#94A3B8", fontStyle: "italic", fontSize: 13 },
    actionContainer: { flexDirection: "row", gap: 12, marginTop: 10 },
    btn: { flex: 1, height: 55, borderRadius: 14, justifyContent: "center", alignItems: "center", elevation: 3 },
    btnPrimary: { backgroundColor: "#2563EB" },
    btnSecondary: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" },
    btnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
    btnTextSecondary: { color: "#EF4444", fontWeight: "800", fontSize: 16 },
});
