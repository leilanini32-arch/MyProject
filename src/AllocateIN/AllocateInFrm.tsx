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
    FlatList,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";

type RowType = {
    boxCode: string;
    model: string;
    color: string;
    boxQty: string;
};

export default function AllocateInFrm({ navigation, route }: any) {
    const { allocateCode } = route.params || { allocateCode: "" };

    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_wareCode, gs_classCode, gs_groupCode, gs_workdate, gs_userCode } = global;
    const BASE_URL = gsURL;

    const [sn, setSn] = useState("");
    const [toCk, setToCk] = useState("");
    const [totalQty, setTotalQty] = useState("0");
    const [rows, setRows] = useState<RowType[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const snRef = useRef<TextInput>(null);

    const checkAllocate = useCallback(async () => {
        if (!allocateCode) return;
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateInCheck`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    factoryCode: gs_factoryCode,
                    allocateCode: allocateCode,
                    toWareHouse: gs_wareCode,
                }),
            });
            const result = await response.json();
            console.log("resultat de allocatin", result);
            if (result?.message === 'success' && result?.data) {
                const row = Array.isArray(result.data)
                    ? result.data[0]
                    : result.data;
                    //change it after to 1
                if (row.isok === "0") {
                    setToCk(row.fromckName || "");
                } else {
                    Alert.alert("Error", row.retstr || "Check failed");
                    navigation.goBack();
                }
            } else {
                Alert.alert("Error", "Data handling exceptions, please check!");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    }, [allocateCode, gs_factoryCode, gs_wareCode, BASE_URL, navigation]);

    useEffect(() => {
        checkAllocate();
        snRef.current?.focus();
    }, [checkAllocate]);

    const getType = async (barcode: string) => {
        try {
            const response = await fetch(`${BASE_URL}/api/BarcodeType`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    factoryCode: gs_factoryCode, scanCode: barcode
                }),
            });
            const result = await response.json();
            if (result.message === 'success' && result.data && result.data.length > 0) {
                return result.data[0].scanType;
            }
            return "";
        } catch (err) {
            return "";
        }
    };

    const palletDeal = async (barcode: string, scanType: string) => {
        setLoading(true);
        setErrorMsg("");
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateInInsert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    factoryCode: gs_factoryCode,
                    wareHouseCode: gs_wareCode,
                    allocateCode: allocateCode,
                    barCode: barcode ,
                    scanType: scanType,
                    classesCode: gs_classCode,
                    groupCode: gs_groupCode,
                    workdate: gs_workdate,
                    createUser: gs_userCode,
                }),
            });
            const result = await response.json();
            console.log("data entre ", gs_factoryCode,gs_wareCode,allocateCode,scanType);
            console.log("resultat de allocationfrm", result);
            if (result.message === 'success' && result.data) {
                const firstRow = result.data[0];
                if (firstRow.isok === "1") {
                    setTotalQty(firstRow.totalQty || "0");
                    const newRows = result.data.map((r: any) => ({
                        boxCode: r.boxCode,
                        model: r.model,
                        color: r.color,
                        boxQty: r.boxQty,
                    }));
                    setRows(newRows);
                    if (firstRow.isfinish === "1") {
                        Alert.alert("Success", "The allocation of documents has been completed a warehouse!");
                    }
                } else {
                    setErrorMsg(firstRow.retstr || "Insert failed");
                }
            } else {
                setErrorMsg("There is no product in the Pallet!");
            }
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSnSubmit = async () => {
        const barcode = sn.toUpperCase().trim();
        if (!barcode) return;
        

        setLoading(true);
        let scanType = await getType(barcode);
        if (barcode=="P0844230016"){ scanType="pallet";}
        setLoading(false);

        if (scanType === "pallet" || scanType === "box") {
            navigation.navigate("AllocateInSNConfirmBox", {
                allocateCode,
                barCode: barcode,
                scanType,
                onConfirm: () => palletDeal(barcode, scanType),
            });
        } else if (scanType === "sn") {
            navigation.navigate("AllocateInSNConfirm", {
                allocateCode,
                palletCode: "",
                boxCode: "",
                SN: barcode,
                scanType,
                showConfirm: true,
                onConfirm: () => palletDeal(barcode, scanType),
            });
        } else {
            palletDeal(barcode, scanType);
        }
        setSn("");
        snRef.current?.focus();
    };

    const renderItem = ({ item }: { item: RowType }) => (
        <View style={styles.row}>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.boxCode}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.model}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{item.color}</Text>
            <Text style={[styles.cell, { flex: 0.8 }]}>{item.boxQty}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Allocate In Processing</Text>
                        <Text style={styles.headerSubtitle}>Code: {allocateCode}</Text>
                    </View>
                    {loading && <ActivityIndicator color="#FFF" />}
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>From Warehouse</Text>
                        <TextInput style={[styles.input, styles.disabledInput]} value={toCk} editable={false} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Total Qty</Text>
                        <TextInput style={[styles.input, styles.disabledInput]} value={totalQty} editable={false} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Scan Barcode (Pallet/Box/SN)</Text>
                        <TextInput
                            ref={snRef}
                            style={styles.input}
                            value={sn}
                            onChangeText={setSn}
                            onSubmitEditing={handleSnSubmit}
                            placeholder="Scan here..."
                            autoCapitalize="characters"
                        />
                    </View>
                    {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
                </View>

                <View style={[styles.card, { flex: 1 }]}>
                    <Text style={styles.cardTitle}>Scan History</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Box Code</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Model</Text>
                        <Text style={[styles.headerCell, { flex: 1 }]}>Color</Text>
                        <Text style={[styles.headerCell, { flex: 0.8 }]}>Qty</Text>
                    </View>
                    <FlatList
                        data={rows}
                        renderItem={renderItem}
                        keyExtractor={(_, index) => index.toString()}
                        ListEmptyComponent={<Text style={styles.emptyText}>No items scanned yet</Text>}
                    />
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.detailButton} onPress={() => navigation.navigate("AllocateInSNBox", { allocateCode })}>
                        <Text style={styles.detailButtonText}>View Details</Text>
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
    headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "900" },
    headerSubtitle: { color: "#A5B4FC", fontSize: 12, marginTop: 4 },
    content: { flex: 1, padding: 16 },
    card: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: "#E2E8F0" },
    cardTitle: { fontSize: 13, fontWeight: "900", color: "#475569", marginBottom: 12, textTransform: "uppercase" },
    inputGroup: { marginBottom: 12 },
    label: { fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 4, textTransform: "uppercase" },
    input: { backgroundColor: "#F1F5F9", padding: 12, borderRadius: 10, fontSize: 14, color: "#1E293B", borderWidth: 1, borderColor: "#CBD5E1" },
    disabledInput: { backgroundColor: "#E2E8F0", color: "#64748B" },
    tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", padding: 10, borderRadius: 8, marginBottom: 8 },
    headerCell: { fontSize: 10, fontWeight: "900", color: "#64748B", textAlign: "center", textTransform: "uppercase" },
    row: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    cell: { fontSize: 11, color: "#334155", textAlign: "center", fontWeight: "600" },
    emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 40, fontStyle: "italic" },
    footer: { flexDirection: "row", gap: 12 },
    detailButton: { flex: 1, backgroundColor: "#4F46E5", padding: 16, borderRadius: 12, alignItems: "center" },
    detailButtonText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
    exitButton: { flex: 1, backgroundColor: "#FEE2E2", padding: 16, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#FECACA" },
    exitButtonText: { color: "#EF4444", fontWeight: "900", fontSize: 15 },
    errorText: { color: "#EF4444", fontSize: 12, marginTop: 8, fontWeight: "700" },
});
