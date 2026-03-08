import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StatusBar,
    Alert,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";

interface PalletDetail {
    id: string;
    fxh: string;
    boxCode: string;
    qty: string;
    model: string;
    color: string;
    orderCode: string;
    palletCode: string;
}

export default function AllocateInSNConfirmBox({ navigation, route }: any) {
    const { allocateCode, barCode, scanType, onConfirm } = route.params || {};
    const global = useGlobal();
    const { gsURL, gs_factoryCode } = global;
    const BASE_URL = gsURL;

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<PalletDetail[]>([]);
    const [palletCode, setPalletCode] = useState("");
    const [totalQty, setTotalQty] = useState(0);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateInPalletSNConfirmBox`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    factoryCode: gs_factoryCode,
                    allocateCode: allocateCode,
                    barCode: barCode,
                    scanType: scanType,
                }),
            });
            const result = await response.json();
            console.log("resultat de csnbox ", result);
            if (result.message === 'success' && result.data && result.data.length > 0) {
                setPalletCode(result.data[0].palletCode || "");
                let sum = 0;
                const mapped = result.data.map((item: any, index: number) => {
                    sum += parseInt(item.qty || "0");
                    return {
                        id: index.toString(),
                        fxh: item.fxh,
                        boxCode: item.boxCode,
                        qty: item.qty,
                        model: item.model,
                        color: item.color,
                        orderCode: item.orderCode,
                        palletCode: item.palletCode,
                    };
                });
                setDetails(mapped);
                setTotalQty(sum);
            } else {
                Alert.alert("Error", "There is no product in the Pallet!");
                //navigation.goBack();
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
            //navigation.goBack();
        } finally {
            setLoading(false);
        }
    }, [allocateCode, barCode, scanType, gs_factoryCode, BASE_URL, navigation]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleConfirm = () => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to confirm this operation?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => {
                        if (onConfirm) onConfirm();
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: PalletDetail }) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("AllocateInSNConfirm", {
                allocateCode,
                palletCode: item.palletCode,
                boxCode: item.boxCode,
                SN: "",
                scanType,
                showConfirm: false
            })}
        >
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.fxh}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.boxCode}</Text>
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.qty}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.model}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{item.color}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.orderCode}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pallet/Box Confirmation</Text>
                <Text style={styles.headerSubtitle}>
                    Pallet: {palletCode} | Total Qty: {totalQty}
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { flex: 0.5 }]}>FXH</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Box Code</Text>
                    <Text style={[styles.headerCell, { flex: 0.5 }]}>Qty</Text>
                    <Text style={[styles.headerCell, { flex: 1.2 }]}>Model</Text>
                    <Text style={[styles.headerCell, { flex: 1 }]}>Color</Text>
                    <Text style={[styles.headerCell, { flex: 1.2 }]}>Order</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={details}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                        <Text style={styles.confirmButtonText}>Confirm (OK)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { backgroundColor: "#1E1B4B", padding: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "900" },
    headerSubtitle: { color: "#A5B4FC", fontSize: 12, marginTop: 4 },
    content: { flex: 1, padding: 16 },
    tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", padding: 12, borderRadius: 10, marginBottom: 8 },
    headerCell: { fontSize: 10, fontWeight: "900", color: "#64748B", textAlign: "center", textTransform: "uppercase" },
    row: { flexDirection: "row", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", backgroundColor: "#FFF", borderRadius: 8, marginBottom: 4 },
    cell: { fontSize: 11, color: "#334155", textAlign: "center", fontWeight: "600" },
    actions: { flexDirection: "row", gap: 12, marginTop: 16 },
    confirmButton: { flex: 1, backgroundColor: "#22C55E", padding: 16, borderRadius: 12, alignItems: "center", elevation: 2 },
    confirmButtonText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
    cancelButton: { flex: 1, backgroundColor: "#EF4444", padding: 16, borderRadius: 12, alignItems: "center", elevation: 2 },
    cancelButtonText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
});
