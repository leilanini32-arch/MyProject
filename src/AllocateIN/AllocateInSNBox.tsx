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

interface PalletSNBoxDetail {
    id: string;
    fxh: string;
    palletCode: string;
    boxCode: string;
    qty: string;
    model: string;
    color: string;
}

export default function AllocateInSNBox({ navigation, route }: any) {
    const { allocateCode } = route.params || {};
    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_wareCode } = global;
    const BASE_URL = gsURL;

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<PalletSNBoxDetail[]>([]);
    const [totalQty, setTotalQty] = useState(0);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateInPalletSNBox`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    factoryCode: gs_factoryCode,
                    wareHouseCode: gs_wareCode,
                    allocateCode: allocateCode,
                }),
            });
            const result = await response.json();
            console.log("resultat de snbox", result);
            console.log("resultat de allocateCode",allocateCode);
            if (result.message === 'success' && result.data) {
                let sum = 0;
                const mapped = result.data.map((item: any, index: number) => {
                    sum += parseInt(item.qty || "0");
                    return {
                        id: index.toString(),
                        fxh: item.fxh,
                        palletCode: item.palletCode,
                        boxCode: item.boxCode,
                        qty: item.qty,
                        model: item.model,
                        color: item.color,
                    };
                });
                setDetails(mapped);
                setTotalQty(sum);
            } else {
                Alert.alert("Error", "There is no product in the Pallet!");
                navigation.goBack();
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    }, [allocateCode, gs_factoryCode, gs_wareCode, BASE_URL, navigation]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const renderItem = ({ item }: { item: PalletSNBoxDetail }) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("AllocateInSN", {
                allocateCode,
                palletCode: item.palletCode,
                boxCode: item.boxCode
            })}
        >
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.fxh}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.palletCode}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.boxCode}</Text>
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.qty}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.model}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{item.color}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Allocation SN Details (Box)</Text>
                <Text style={styles.headerSubtitle}>
                    Allocate Code: {allocateCode} | Total Qty: {totalQty}
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { flex: 0.5 }]}>FXH</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Pallet</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Box</Text>
                    <Text style={[styles.headerCell, { flex: 0.5 }]}>Qty</Text>
                    <Text style={[styles.headerCell, { flex: 1.2 }]}>Model</Text>
                    <Text style={[styles.headerCell, { flex: 1 }]}>Color</Text>
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
                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButtonText}>Close</Text>
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
    cancelButton: { flex: 1, backgroundColor: "#EF4444", padding: 16, borderRadius: 12, alignItems: "center", elevation: 2 },
    cancelButtonText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
});
