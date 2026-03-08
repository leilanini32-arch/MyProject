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
    createDate: string;
    model: string;
    color: string;
};

export default function DeliverySN({ navigation, route }: any) {
    const { deliveryCode, palletCode: initialPalletCode, boxCode: initialBoxCode } = route.params || {};
    const global = useGlobal();
    const { gsURL } = global;
    const BASE_URL = gsURL;

    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<SNDetail[]>([]);
    const [title, setTitle] = useState("");

    useEffect(() => {
        if (deliveryCode) {
            fetchSNDetails();
        }
    }, [deliveryCode]);

    const fetchSNDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/DeliveryPalletSN`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    factoryCode: global.gs_factoryCode,
                    wareHouseCode: global.gs_wareCode,
                    deliveryCode: deliveryCode,
                    palletCode: initialPalletCode || "",
                    boxCode: initialBoxCode || ""
                })
            });

            const result = await response.json();
            if (result.message == "success" && result.data && result.data.length > 0) {
                const list: SNDetail[] = result.data.map((item: any) => ({
                    fxh: item.fxh,
                    sn: item.sn,
                    imeiCode1: item.imeiCode1,
                    imeiCode2: item.imeiCode2,
                    imeiCode3: item.imeiCode3,
                    createDate: item.createDate,
                    model: item.model,
                    color: item.color
                }));
                console.log("message4", result);
                setDetails(list);

                const baseTitle = `Pallet: ${initialPalletCode || ""} Box: ${initialBoxCode || ""}`;
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

    const tableHeaders = ["FXH", "SN", "IMEI 1", "IMEI 2", "IMEI 3", "Create Date"];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Delivery SN Details</Text>
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
                                            <Text style={styles.cell}>{item.createDate}</Text>
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
                    <TouchableOpacity
                        style={[styles.btn, styles.btnSecondary]}
                        onPress={() => navigation.goBack()}
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
    headerCell: { width: 120, textAlign: "center", fontSize: 10, fontWeight: "800", color: "#64748B", textTransform: "uppercase" },
    tableDataRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    cell: { width: 120, textAlign: "center", paddingVertical: 15, fontSize: 11, color: "#334155", fontWeight: "600" },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40, width: 600 },
    emptyText: { color: "#94A3B8", fontStyle: "italic", fontSize: 13 },
    actionContainer: { flexDirection: "row", gap: 12, marginTop: 10 },
    btn: { flex: 1, height: 55, borderRadius: 14, justifyContent: "center", alignItems: "center", elevation: 3 },
    btnSecondary: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" },
    btnTextSecondary: { color: "#EF4444", fontWeight: "800", fontSize: 16 },
});
