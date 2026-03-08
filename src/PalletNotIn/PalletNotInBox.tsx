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

interface BoxItem {
    id: string;
    fxh: string;
    palletCode: string;
    boxCode: string;
    qty: string;
    model: string;
    color: string;
}

export default function PalletNotInBox({ navigation, route }: any) {
    const { palletCode } = route.params || {};
    const global = useGlobal();
    const { gsURL, gs_factoryCode } = global;
    const BASE_URL = gsURL;

    const [loading, setLoading] = useState(true);
    const [boxes, setBoxes] = useState<BoxItem[]>([]);
    const [totalQty, setTotalQty] = useState(0);

    const fetchBoxes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/PalletNotInBox`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ factoryCode: gs_factoryCode, palletCode: palletCode }),
            });
            const result = await response.json();
            console.log("resultas boxnotin",result);
            if (result.message === "success" && result.data && result.data.length > 0) {
                let total = 0;
                const mapped = result.data.map((item: any, index: number) => {
                    total += parseInt(item.qty || "0");
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
                setBoxes(mapped);
                setTotalQty(total);
            } else {
                setBoxes([]);
                setTotalQty(0);
                Alert.alert("Notice", "There is no product in the Pallet!");
                navigation.goBack();
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    }, [gs_factoryCode, BASE_URL, palletCode, navigation]);

    useEffect(() => {
        fetchBoxes();
    }, [fetchBoxes]);

    const renderItem = ({ item }: { item: BoxItem }) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("PalletNotInSN", { palletCode: item.palletCode, boxCode: item.boxCode })}
        >
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.fxh}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.boxCode}</Text>
            <Text style={[styles.cell, { flex: 0.6 }]}>{item.qty}</Text>
            <View style={{ flex: 1.5 }}>
                <Text style={styles.cellMain}>{item.model}</Text>
                <Text style={styles.cellSub}>{item.color}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pallet Boxes</Text>
                <Text style={styles.headerSubtitle}>Pallet: {palletCode}</Text>
                <View style={styles.headerStats}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Qty</Text>
                        <Text style={styles.statValue}>{totalQty}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Boxes Count</Text>
                        <Text style={styles.statValue}>{boxes.length}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { flex: 0.5 }]}>FXH</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Box Code</Text>
                    <Text style={[styles.headerCell, { flex: 0.6 }]}>Qty</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Model/Color</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={boxes}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.exitButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.exitButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { backgroundColor: "#1E1B4B", padding: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "900" },
    headerSubtitle: { color: "#A5B4FC", fontSize: 12, marginTop: 4, marginBottom: 16 },
    headerStats: { flexDirection: "row", gap: 12 },
    statBox: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 12 },
    statLabel: { color: "#A5B4FC", fontSize: 10, textTransform: "uppercase", fontWeight: "700" },
    statValue: { color: "#FFF", fontSize: 14, fontWeight: "800", marginTop: 2 },
    content: { flex: 1, padding: 16 },
    tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", padding: 12, borderRadius: 10, marginBottom: 8 },
    headerCell: { fontSize: 10, fontWeight: "900", color: "#64748B", textAlign: "center", textTransform: "uppercase" },
    row: { flexDirection: "row", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", backgroundColor: "#FFF", borderRadius: 8, marginBottom: 4, alignItems: "center" },
    cell: { fontSize: 11, color: "#334155", textAlign: "center", fontWeight: "600" },
    cellMain: { fontSize: 11, color: "#1E293B", fontWeight: "700", textAlign: "center" },
    cellSub: { fontSize: 10, color: "#64748B", textAlign: "center" },
    actions: { marginTop: 16 },
    exitButton: { backgroundColor: "#EF4444", padding: 16, borderRadius: 12, alignItems: "center" },
    exitButtonText: { color: "#FFF", fontWeight: "900" },
});
