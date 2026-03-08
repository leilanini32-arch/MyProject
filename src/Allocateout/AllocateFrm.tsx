import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";

type RowType = {
    boxCode: string;
    model: string;
    color: string;
    boxQty: string;
};

export default function AllocateFrm({ navigation, route }: any) {
    const { allocateCode } = route.params || { allocateCode: "" };

    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_wareCode, gs_wareType, gs_classCode, gs_groupCode, gs_workdate, gs_userCode } = global;
    const BASE_URL = gsURL;

    const [barcode, setBarcode] = useState("");
    const [toCkName, setToCkName] = useState("");
    const [totalQty, setTotalQty] = useState("");
    const [tableData, setTableData] = useState<RowType[]>([]);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef<TextInput>(null);

    const fetchAllocateCheck = useCallback(async () => {
        if (!allocateCode) return;
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateCheck`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    FactoryCode: gs_factoryCode,
                    allocateCode: allocateCode,
                    FromWareHouse: gs_wareCode,
                }),
            });

            const result = await response.json();
            if (result.message === 'success' && result.data) {
                const data = result.data;
                setToCkName(data.tockName || "");
            } else {
                Alert.alert("Error", result.message || "Data handling exceptions, please check!");
                navigation.goBack();
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch allocate details");
        } finally {
            setLoading(false);
        }
    }, [allocateCode, gs_factoryCode, gs_wareCode, BASE_URL, navigation]);

    useEffect(() => {
        fetchAllocateCheck();
    }, [fetchAllocateCheck]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            inputRef.current?.focus();
        });
        return unsubscribe;
    }, [navigation]);

    const handleBarcodeSubmit = async () => {
        const sn = barcode.toUpperCase().trim();
        if (!sn) return;

        setLoading(true);
        try {
            // 1. Get Barcode Type
            const typeResponse = await fetch(`${BASE_URL}/api/BarcodeType`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ factoryCode: gs_factoryCode, scanCode: sn }),
            });
            const typeResult = await typeResponse.json();
            console.log("barcodetype",typeResult)
            let scanType = typeResult.message === 'success' && typeResult.data.scanType  ? typeResult.data.scanType : "";

            if (!scanType) {
                Alert.alert("Error", "Unknown barcode type");
                setBarcode("");
                inputRef.current?.focus();
                return;
            }

          

            // 2. Confirmation if needed
            if (scanType === "pallet" || scanType === "box") {
                navigation.navigate("AllocateSNConfirmBox", {
                    fromWareHouseCode: gs_wareCode,
                    barCode: sn,
                    scanType: scanType,
                    onConfirm: () => processInsert(sn, scanType)
                });
                setBarcode("");
                return;
            }

            if (scanType === "sn") {
                navigation.navigate("AllocateSNConfirm", {
                    fromWareHouseCode: gs_wareCode,
                    palletCode: "",
                    boxCode: "",
                    SN: sn,
                    scanType: scanType,
                    showConfirm: true,
                    onConfirm: () => processInsert(sn, scanType)
                });
                setBarcode("");
                return;
            }

            await processInsert(sn, scanType);
        } catch (error) {
            Alert.alert("Error", "Failed to process barcode");
        } finally {
            setLoading(false);
        }
    };

    const processInsert = async (barCode: string, scanType: string) => {
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateInsert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    FactoryCode: gs_factoryCode,
                    FromWareHouse: gs_wareCode,
                    WareHouseType: gs_wareType,
                    allocateCode: allocateCode,
                    BarCode: barCode,
                    ScanType: scanType,
                    ClassCode: gs_classCode,
                    GroupCode: gs_groupCode,
                    WorkDate: gs_workdate,
                    UserCode: gs_userCode,
                }),
            });

            const result = await response.json();
            console.log(result);
            if (result.message === 'success' && result.data) {
                const dataList = result.data;
                if (dataList.length > 0) {
                    setTotalQty(dataList[0].totalQty?.toString() || "");
                    const isfinish = dataList[0].isfinish?.toString();

                    const newRows = dataList.map((item: any) => ({
                        boxCode: item.boxCode,
                        model: item.model,
                        color: item.color,
                        boxQty: item.boxQty?.toString(),
                    }));

                    setTableData(prev => [...newRows, ...prev]);

                    if (isfinish === "1") {
                        Alert.alert("Success", "The allocation of documents has been completed a warehouse!");
                    }else{
                         Alert.alert("Error", dataList[0].retstr);
                    }
                }
            } else {
                Alert.alert("Error", result.message || "Failed to insert data");
            }
        } catch (error) {
            Alert.alert("Error", "Network error during insertion");
        } finally {
            setBarcode("");
            inputRef.current?.focus();
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Allocate Scanning</Text>
                <Text style={styles.headerSubtitle}>Code: {allocateCode}</Text>
            </View>

            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>TO WH</Text>
                        <TextInput style={[styles.input, styles.disabledInput]} value={toCkName} editable={false} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>SCAN BARCODE</Text>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            value={barcode}
                            onChangeText={setBarcode}
                            onSubmitEditing={handleBarcodeSubmit}
                            placeholder="Scan Pallet/Box/SN"
                            autoFocus={true}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>TOTAL QTY</Text>
                        <TextInput style={[styles.input, styles.disabledInput]} value={totalQty} editable={false} />
                    </View>
                </View>

                <View style={styles.tableCard}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.columnHeader, { flex: 1.5 }]}>Box Code</Text>
                        <Text style={[styles.columnHeader, { flex: 1.5 }]}>Model</Text>
                        <Text style={[styles.columnHeader, { flex: 1 }]}>Color</Text>
                        <Text style={[styles.columnHeader, { flex: 0.8 }]}>Qty</Text>
                    </View>
                    <ScrollView style={styles.tableBody}>
                        {tableData.length === 0 ? (
                            <Text style={styles.emptyText}>No items scanned yet</Text>
                        ) : (
                            tableData.map((row, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.cell, { flex: 1.5 }]}>{row.boxCode}</Text>
                                    <Text style={[styles.cell, { flex: 1.5 }]}>{row.model}</Text>
                                    <Text style={[styles.cell, { flex: 1 }]}>{row.color}</Text>
                                    <Text style={[styles.cell, { flex: 0.8, fontWeight: 'bold' }]}>{row.boxQty}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('AllocateSNBox', { allocateCode })}
                    >
                        <Text style={styles.actionButtonText}>SN Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.exitButton]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.exitButtonText}>Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
    header: {
        backgroundColor: "#1E1B4B",
        padding: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
    headerSubtitle: { color: "#A5B4FC", fontSize: 12, marginTop: 4 },
    container: { flex: 1, padding: 15 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    inputGroup: { marginBottom: 12 },
    label: { fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 4, textTransform: "uppercase" },
    input: {
        backgroundColor: "#F1F5F9",
        padding: 12,
        borderRadius: 10,
        fontSize: 14,
        color: "#1E293B",
        borderWidth: 1,
        borderColor: "#CBD5E1",
    },
    disabledInput: { backgroundColor: "#E2E8F0", color: "#475569" },
    tableCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        elevation: 2,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#F1F5F9",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    columnHeader: { fontSize: 11, fontWeight: "900", color: "#475569", textTransform: "uppercase", textAlign: "center" },
    tableBody: { flex: 1 },
    tableRow: {
        flexDirection: "row",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        alignItems: "center",
    },
    cell: { fontSize: 11, color: "#1E293B", textAlign: "center" },
    emptyText: { textAlign: "center", padding: 40, color: "#94A3B8", fontStyle: "italic" },
    actions: { flexDirection: "row", gap: 12, marginTop: 15 },
    actionButton: {
        flex: 1,
        backgroundColor: "#2563EB",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    actionButtonText: { color: "#fff", fontWeight: "900", fontSize: 16 },
    exitButton: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" },
    exitButtonText: { color: "#EF4444", fontWeight: "900", fontSize: 16 },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.7)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
});
