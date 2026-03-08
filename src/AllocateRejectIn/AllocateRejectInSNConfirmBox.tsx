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

interface PalletBoxDetail {
    id: string;
    fxh: string;
    boxCode: string;
    qty: string;
    model: string;
    color: string;
    orderCode: string;
    allocateCode: string;
    systemAllocateCode: string;
    palletCode: string;
}

export default function AllocateRejectInSNConfirmBox({ navigation, route }: any) {
    const { barCode, scanType, onConfirm, onCancel } = route.params || {};
    const global = useGlobal();
    const { gsURL, gs_factoryCode } = global;
    const BASE_URL = gsURL;

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<PalletBoxDetail[]>([]);
    const [qtyTotal, setQtyTotal] = useState(0);
    const [palletCode, setPalletCode] = useState("");
    const [systemBill, setSystemBill] = useState("");
    const [allocateCode, setAllocateCode] = useState("");

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateInPalletSNConfirmBoxInject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    factoryCode: gs_factoryCode,
                    allocateCode: "", // Initially empty as per C# code
                    barCode: barCode,
                    scanType: scanType,
                }),
            });
            const result = await response.json();
            console.log("reject snbox ", result);
            if (result.message === 'success' && result.data && result.data.length > 0) {
                let total = 0;
                const mapped = result.data.map((item: any, index: number) => {
                    total += parseInt(item.qty || "0");
                    return {
                        id: index.toString(),
                        fxh: item.fxh,
                        boxCode: item.boxCode,
                        qty: item.qty,
                        model: item.model,
                        color: item.color,
                        orderCode: item.orderCode,
                        allocateCode: item.allocateCode,
                        systemAllocateCode: item.systemAllocateCode,
                        palletCode: item.palletCode,
                    };
                });
                setDetails(mapped);
                setQtyTotal(total);
                setPalletCode(result.data[0].palletCode || "");
                setSystemBill(result.data[0].systemAllocateCode || "");
                setAllocateCode(result.data[0].allocateCode || "");
            } else {
                Alert.alert("Error", "There is no product in the Pallet!");
             
                onCancel?.();
                //navigation.goBack();
            }
        } catch (err: any) {
            Alert.alert("Error ", err.message);
            onCancel?.();
            //navigation.goBack();
        } finally {
            setLoading(false);
        }
    }, [barCode, scanType, gs_factoryCode, BASE_URL, navigation, onCancel]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const renderItem = ({ item }: { item: PalletBoxDetail }) => (
        <View style={styles.row}>
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.fxh}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.boxCode}</Text>
            <Text style={[styles.cell, { flex: 0.6 }]}>{item.qty}</Text>
            <View style={{ flex: 1.5 }}>
                <Text style={styles.cellMain}>{item.model}</Text>
                <Text style={styles.cellSub}>{item.color}</Text>
            </View>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.orderCode}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pallet Confirmation</Text>
                <Text style={styles.headerSubtitle}>
                    Pallet: {palletCode} | Total Qty: {qtyTotal} | SAP: {systemBill}
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { flex: 0.5 }]}>FXH</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Box Code</Text>
                    <Text style={[styles.headerCell, { flex: 0.6 }]}>Qty</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Model/Color</Text>
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
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => {
                            onConfirm?.(allocateCode);
                            navigation.goBack();
                        }}
                    >
                        <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                            onCancel?.();
                            navigation.goBack();
                        }}
                    >
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
    row: { flexDirection: "row", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", backgroundColor: "#FFF", borderRadius: 8, marginBottom: 4, alignItems: "center" },
    cell: { fontSize: 11, color: "#334155", textAlign: "center", fontWeight: "600" },
    cellMain: { fontSize: 11, color: "#1E293B", fontWeight: "700", textAlign: "center" },
    cellSub: { fontSize: 10, color: "#64748B", textAlign: "center" },
    actions: { flexDirection: "row", gap: 12, marginTop: 16 },
    confirmButton: { flex: 1, backgroundColor: "#10B981", padding: 16, borderRadius: 12, alignItems: "center", elevation: 2 },
    confirmButtonText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
    cancelButton: { flex: 1, backgroundColor: "#EF4444", padding: 16, borderRadius: 12, alignItems: "center", elevation: 2 },
    cancelButtonText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
});
