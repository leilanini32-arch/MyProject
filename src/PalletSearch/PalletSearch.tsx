import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StatusBar,
    Alert,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";

interface PalletBoxItem {
    id: string;
    fxh: string;
    palletCode: string;
    boxCode: string;
    qty: string;
    model: string;
    color: string;
    orderCode: string;
}

export default function PalletSearch({ navigation }: any) {
    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_wareCode } = global;
    const BASE_URL = gsURL;

    const [sn, setSn] = useState("");
    const [loading, setLoading] = useState(false);
    const [boxList, setBoxList] = useState<PalletBoxItem[]>([]);
    const [totalQty, setTotalQty] = useState(0);
    const [currentPallet, setCurrentPallet] = useState("");

    const snInputRef = useRef<TextInput>(null);

    useEffect(() => {
        snInputRef.current?.focus();
    }, []);

    const handleScan = async () => {
        if (!sn.trim()) return;
        const inputSn = sn.toUpperCase().trim();
        setSn("");
        setLoading(true);

        try {
            // 1. Get Barcode Type
            const typeRes = await fetch(`${BASE_URL}/api/BarcodeType`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ factoryCode: gs_factoryCode, scanCode: inputSn }),
            });
            const typeResult = await typeRes.json();

            let scanType = "";
            if (typeResult.message === "success" && typeResult.data && typeResult.data.length > 0) {
                scanType = typeResult.data[0].scanType;
            }

            //delete it after
            if (scanType === "" ){ scanType="pallet"; }
            

            let palletCode = "";
            if (scanType === "box" || scanType === "sn") {
                // 2. Get Pallet Code from Box/SN
                const palletRes = await fetch(`${BASE_URL}/api/GetWarePallet`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ factoryCode: gs_factoryCode, scanType: scanType, scanCode: inputSn }),
                });
                const palletResult = await palletRes.json();
                if (palletResult.message === "success" && palletResult.data && palletResult.data.length > 0) {
                    palletCode = palletResult.data[0].palletCode;
                } else {
                    throw new Error("Could not find associated pallet for this barcode.");
                }
            } else {
                palletCode = inputSn;
            }

            setCurrentPallet(palletCode);
            await fetchPalletDetails(palletCode);
        } catch (err: any) {
            Alert.alert("Error", err.message);
            setLoading(false);
        } finally {
            snInputRef.current?.focus();
        }
    };

    const fetchPalletDetails = async (palletCode: string) => {
        
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/DeliveryPalletSNConfirmBox`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    FactoryCode: gs_factoryCode,
                    FromWareHouseCode: gs_wareCode,
                    BarCode: palletCode,
                    ScanType: "pallet",
                }),
            });

            const result = await response.json();
            console.log("palletsearche",result);
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
                        orderCode: item.orderCode,
                    };
                });
                setBoxList(mapped);
                setTotalQty(total);
            } else {
                setBoxList([]);
                setTotalQty(0);
                Alert.alert("Notice", "There is no product in the Pallet!");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: PalletBoxItem }) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("PalletSNDetails", {
                palletCode: item.palletCode,
                boxCode: item.boxCode
            })}
        >
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.fxh}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.boxCode}</Text>
            <Text style={[styles.cell, { flex: 0.6 }]}>{item.qty}</Text>
            <View style={{ flex: 1.5 }}>
                <Text style={styles.cellMain}>{item.model}</Text>
                <Text style={styles.cellSub}>{item.color}</Text>
            </View>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.orderCode}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pallet Search</Text>
                <View style={styles.headerStats}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Current Pallet</Text>
                        <Text style={styles.statValue}>{currentPallet || "-"}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Qty</Text>
                        <Text style={styles.statValue}>{totalQty}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Scan Pallet / Box / SN</Text>
                    <TextInput
                        ref={snInputRef}
                        style={styles.input}
                        value={sn}
                        onChangeText={setSn}
                        placeholder="Scan here..."
                        onSubmitEditing={handleScan}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { flex: 0.5 }]}>FXH</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Box Code</Text>
                    <Text style={[styles.headerCell, { flex: 0.6 }]}>Qty</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Model/Color</Text>
                    <Text style={[styles.headerCell, { flex: 1.2 }]}>Order</Text>
                </View>

                {loading && boxList.length === 0 ? (
                    <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={boxList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            !loading ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>No data to display. Scan a barcode to start.</Text>
                                </View>
                            ) : null
                        }
                    />
                )}

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.exitButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.exitButtonText}>Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { backgroundColor: "#1E1B4B", padding: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "900", marginBottom: 16 },
    headerStats: { flexDirection: "row", gap: 12 },
    statBox: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 12 },
    statLabel: { color: "#A5B4FC", fontSize: 10, textTransform: "uppercase", fontWeight: "700" },
    statValue: { color: "#FFF", fontSize: 14, fontWeight: "800", marginTop: 2 },
    content: { flex: 1, padding: 16 },
    inputSection: { marginBottom: 20 },
    inputLabel: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 8, textTransform: "uppercase" },
    input: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 14, fontSize: 16, color: "#1E293B", fontWeight: "600" },
    tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", padding: 12, borderRadius: 10, marginBottom: 8 },
    headerCell: { fontSize: 10, fontWeight: "900", color: "#64748B", textAlign: "center", textTransform: "uppercase" },
    row: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", backgroundColor: "#FFF", borderRadius: 8, marginBottom: 4, alignItems: "center" },
    cell: { fontSize: 11, color: "#334155", textAlign: "center", fontWeight: "600" },
    cellMain: { fontSize: 11, color: "#1E293B", fontWeight: "700", textAlign: "center" },
    cellSub: { fontSize: 10, color: "#64748B", textAlign: "center" },
    emptyState: { marginTop: 40, alignItems: "center" },
    emptyStateText: { color: "#94A3B8", fontSize: 14, fontWeight: "500" },
    actions: { marginTop: 16 },
    exitButton: { backgroundColor: "#EF4444", padding: 16, borderRadius: 12, alignItems: "center" },
    exitButtonText: { color: "#FFF", fontWeight: "900" },
});
