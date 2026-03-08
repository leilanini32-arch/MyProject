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
    Keyboard,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";

interface BoxItem {
    id: string;
    boxCode: string;
    model: string;
    color: string;
    boxQty: string;
    systemAllocateCode: string;
    allocateCode: string;
}

export default function AllocateRejectIn({ navigation }: any) {
    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_wareCode, gs_classCode, gs_groupCode, gs_workdate, gs_userCode } = global;
    const BASE_URL = gsURL;

    const [sn, setSn] = useState("");
    const [qty, setQty] = useState("");
    const [sysBill, setSysBill] = useState("");
    const [loading, setLoading] = useState(false);
    const [boxList, setBoxList] = useState<BoxItem[]>([]);
    const [allocateCode, setAllocateCode] = useState("");
    const snInputRef = useRef<TextInput>(null);

    useEffect(() => {
        snInputRef.current?.focus();
    }, []);

    const handleScan = async () => {
        if (!sn.trim()) return;
        const currentSn = sn.toUpperCase().trim();
        setSn("");
        setLoading(true);

        try {
            // 1. Get Barcode Type
            const typeRes = await fetch(`${BASE_URL}/api/BarcodeType`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ factoryCode: gs_factoryCode, scanCode: currentSn }),
            });
            const typeResult = await typeRes.json();
            let scanType = "";
            if (typeResult.message === "success" && typeResult.data && typeResult.data.length > 0) {
                scanType = typeResult.data[0].scanType;
            }

            // Default to SN if not recognized Change it after
            if (!scanType) {
                scanType = "pallet";
            }

            // 2. Handle Confirmation Screens
            let confirmedAllocateCode = allocateCode;

            if (scanType === "pallet" || scanType === "box") {
                // Navigate to ConfirmBox and wait for result
                navigation.navigate("AllocateRejectInSNConfirmBox", {
                    barCode: currentSn,
                    scanType: scanType,
                    onConfirm: (returnedAllocateCode: string) => {
                        setAllocateCode(returnedAllocateCode);
                        processPalletDeal(currentSn, scanType, returnedAllocateCode);
                    },
                    onCancel: () => {
                        setQty("");
                        setAllocateCode("");
                        setBoxList([]);
                        setLoading(false);
                    }
                });
                return; // processPalletDeal will be called from callback
            } else if (scanType === "sn") {
                navigation.navigate("AllocateRejectInSNConfirm", {
                    sn: currentSn,
                    scanType: scanType,
                    showConfirm: true,
                    onConfirm: (returnedAllocateCode: string) => {
                        setAllocateCode(returnedAllocateCode);
                        processPalletDeal(currentSn, scanType, returnedAllocateCode);
                    },
                    onCancel: () => {
                        setQty("");
                        setAllocateCode("");
                        setBoxList([]);
                        setLoading(false);
                    }
                });
                return; // processPalletDeal will be called from callback
            }

            // If we reach here (unlikely given logic above), process directly
            await processPalletDeal(currentSn, scanType, confirmedAllocateCode);
        } catch (err: any) {
            Alert.alert("Error", err.message);
            setLoading(false);
        }
    };

    const processPalletDeal = async (barCode: string, scanType: string, currentAllocateCode: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateInInsertReject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    factoryCode: gs_factoryCode,
                    wareHouseCode: gs_wareCode,
                    allocateCode: currentAllocateCode,
                    barCode: barCode,
                    scanType: scanType,
                    classCode: gs_classCode,
                    groupCode: gs_groupCode,
                    workdate: gs_workdate,
                    createUser: gs_userCode,
                }),
            });

            const result = await response.json();
            console.log("reject ",result);
            if (result.message === "success" && result.data && result.data.length > 0) {
                if (result.data[0].isOk === "1") {
                    setQty(result.data[0].totalQty || "0");
                    setSysBill(result.data[0].systemAllocateCode || "");

                    const mapped = result.data.map((item: any, index: number) => ({
                        id: index.toString(),
                        boxCode: item.boxCode,
                        model: item.model,
                        color: item.color,
                        boxQty: item.boxQty,
                        systemAllocateCode: item.systemAllocateCode,
                        allocateCode: item.allocateCode,
                    }));
                    setBoxList(mapped);
                } else {
                    Alert.alert("Error", result.data[0].retstr || "Unknown error");
                }
            } else {
                Alert.alert("Error", "There is no product in the Pallet!");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
            snInputRef.current?.focus();
        }
    };

    const renderItem = ({ item }: { item: BoxItem }) => (
        <View style={styles.row}>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.boxCode}</Text>
            <View style={{ flex: 2 }}>
                <Text style={styles.cellMain}>{item.model}</Text>
                <Text style={styles.cellSub}>{item.color}</Text>
            </View>
            <Text style={[styles.cell, { flex: 0.8 }]}>{item.boxQty}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.systemAllocateCode}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Allocation Reject In</Text>
                <View style={styles.headerStats}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Qty</Text>
                        <Text style={styles.statValue}>{qty || "0"}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Bill NO</Text>
                        <Text style={styles.statValue}>{sysBill || "-"}</Text>
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
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Box Code</Text>
                    <Text style={[styles.headerCell, { flex: 2 }]}>Model/Color</Text>
                    <Text style={[styles.headerCell, { flex: 0.8 }]}>Qty</Text>
                    <Text style={[styles.headerCell, { flex: 1.2 }]}>SAP Bill</Text>
                </View>

                {loading && boxList.length === 0 ? (
                    <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={boxList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => {

                            if (allocateCode) {
                                navigation.navigate("AllocateInSNBox", {
                                    allocateCode: allocateCode + "-AllocateRejIn"
                                });
                            } else {
                                Alert.alert("Notice", "Please scan a barcode first.");
                            }
                        }}
                    >
                        <Text style={styles.detailButtonText}>SN Details</Text>
                    </TouchableOpacity>
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
    statValue: { color: "#FFF", fontSize: 16, fontWeight: "800", marginTop: 2 },
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
    actions: { flexDirection: "row", gap: 12, marginTop: 16 },
    detailButton: { flex: 1, backgroundColor: "#4F46E5", padding: 16, borderRadius: 12, alignItems: "center" },
    detailButtonText: { color: "#FFF", fontWeight: "900" },
    exitButton: { flex: 1, backgroundColor: "#EF4444", padding: 16, borderRadius: 12, alignItems: "center" },
    exitButtonText: { color: "#FFF", fontWeight: "900" },
});
