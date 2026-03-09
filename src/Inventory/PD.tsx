import React, { useState, useEffect, useCallback, useRef } from "react";
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
    TextInput,
    ScrollView,
    Dimensions, Platform
} from "react-native";
import { useGlobal } from "../../GlobalContext";

interface ScannedItem {
    id: string;
    barcode: string;
    model: string;
    color: string;
    qty: string;
}

interface InventoryOrder {
    inventoryNo: string;
}

export default function PD({ navigation }: any) {
    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_wareCode, gs_userCode } = global;
    const BASE_URL = gsURL;

    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<InventoryOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState("");
    const [inventoryType, setInventoryType] = useState("");
    const [model, setModel] = useState("");
    const [status, setStatus] = useState("");
    const [barcode, setBarcode] = useState("");
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [totalQty, setTotalQty] = useState(0);
    const [showConfirmBtn, setShowConfirmBtn] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);

    const barcodeInputRef = useRef<TextInput>(null);

    const ensureFocus = () => {
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
        }
    };

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                factoryCode: gs_factoryCode,
                warehouseCode: gs_wareCode,
                inventoryNo: "",
            }).toString();

            const response = await fetch(`${BASE_URL}/api/Inventory/GetInventoryOrder?${query}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();
            console.log("getinvenoty1 ", result);
            if (result.message === "success" && result.data) {
                setOrders(result.data);
                

            } else {
                setOrders([]);
            }
        } catch (err: any) {
            Alert.alert("Error", "Failed to fetch inventory orders: " + err.message);

        } finally {
            setLoading(false);
        }
    }, [gs_factoryCode, gs_wareCode, BASE_URL]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const fetchOrderDetails = async (orderNo: string) => {
        if (!orderNo) return;
        setLoading(true);
        try {

            const url = `${BASE_URL}/api/Inventory/GetInventoryOrder?factoryCode=${encodeURIComponent(gs_factoryCode)}&warehouseCode=${encodeURIComponent(gs_wareCode)}&inventoryNo=${encodeURIComponent(orderNo)}`;

            const response = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();
            if (result.message === "success" && result.data && result.data.length > 0) {
                barcodeInputRef.current?.focus();
                const order = result.data[0];
                setInventoryType(order.inventoryType || "");
                setModel(order.model || "");
                setStatus(order.inventoryflag || "");

                const flag = (order.inventoryflag || "").toLowerCase();
                setShowConfirmBtn(flag === "notstart" || flag === "start");
            } else {
                setInventoryType("");
                setModel("");
                setStatus("Finish");
                setShowConfirmBtn(false);
            }
            fetchHistory(orderNo);
        } catch (err: any) {
            Alert.alert("Error", "Failed to fetch order details: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (orderNo: string) => {
        if (!orderNo) return;
        try {
            const url = `${BASE_URL}/api/InventoryHistory/${encodeURIComponent(gs_factoryCode)}/${encodeURIComponent(gs_wareCode)}/${encodeURIComponent(orderNo)}`;

            const response = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("inventhistory", result)
            if (result.message === "success" && result.data) {
                let total = 0;
                const mapped = result.data.map((item: any, index: number) => {
                    total += parseInt(item.qty || "0");
                    return {
                        id: index.toString(),
                        barcode: item.barcode,
                        model: item.model,
                        color: item.color,
                        qty: item.qty,
                    };
                });
                setScannedItems(mapped);
                setTotalQty(total);
            } else {
                setScannedItems([]);
                setTotalQty(0);
            }
        } catch (err: any) {
            console.error("History fetch error:", err);
            Alert.alert("Error", "Failed to fetch inventory history: " + err.message);
        }
    };

    const handleScan = async (text?: string) => {
        if (!selectedOrder) {
            Alert.alert("Notice", "Please select inventory NO. first.");
            return;
        }
        const code = (text || barcode).trim().toUpperCase();
        if (!code) return;

        setLoading(true);
        try {
            // 1. Get Barcode Type
            const typeRes = await fetch(`${BASE_URL}/api/BarcodeType`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ factoryCode: gs_factoryCode, scanCode: code }),
            });
            const typeResult = await typeRes.json();
            let scanType = "";
            if (typeResult.message === "success" && typeResult.data && typeResult.data.length > 0) {
                scanType = typeResult.data[0].scanType;
            }
            //change it after
            if (scanType === "pallet" || scanType === "box" || scanType === "sn" || code === "P0140480205") {
                // 2. Check and Write Scan
                const scanRes = await fetch(`${BASE_URL}/api/InventoryScan/CheckAndWriteScan`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        factoryCode: gs_factoryCode,
                        warehouseCode: gs_wareCode,
                        inventoryNo: selectedOrder,
                        inventoryType: inventoryType,
                        inventoryModel: model,
                        scanCode: code,
                        scanType: scanType || "pallet", // use detected type or fallback to pallet
                        userCode: gs_userCode,
                    }),
                });
                const scanResult = await scanRes.json();
                console.log("checkandwritescan ", scanResult);
                if (scanResult.message === "success" && scanResult.data) {
                    const resultData = scanResult.data;

                    if (resultData.isok === "0") {
                        Alert.alert("Error", resultData.retstr || "Scan failed");
                    } else {
                        Alert.alert("Success", "scan successfully.");
                        const addedQty = parseInt(resultData.qty || "0");
                        
                        const newItem = {
                            id: Date.now().toString(),
                            barcode: resultData.barcode,
                            model: resultData.model,
                            color: resultData.color,
                            qty: resultData.qty,
                        };


                        setScannedItems(prev => [newItem, ...prev]);
                        setTotalQty(prev => prev + addedQty);
                    }
                } else {
                    Alert.alert("Error", "No data returned from scan.");
                }
            } else {
                Alert.alert("Error", `[${code}] is not a valid SN/Pallet/Box No.`);
            }
        } catch (err: any) {
            Alert.alert("Error", "Scan processing error: " + err.message);
        } finally {
            setLoading(false);
            setBarcode("");
            barcodeInputRef.current?.focus();
        }
    };

    const handleConfirm = () => {
        if (!selectedOrder) {
            Alert.alert("Notice", "Please select inventory NO. first.");
            return;
        }
        Alert.alert(
            "Confirm",
            "Are you sure All Pallet/Box/SN finish?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "OK",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await fetch(`${BASE_URL}/api/InventoryConfirm`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    factoryCode: gs_factoryCode,
                                    warehouseCode: gs_wareCode,
                                    inventoryNo: selectedOrder,
                                    inventoryType: inventoryType,
                                    inventoryModel: model,
                                }),
                            });
                            const result = await response.json();
                            if (result.message === "success") {
                                Alert.alert("Success", "Inventory confirmed successfully.");
                                setShowConfirmBtn(false);
                                setStatus("Finish");
                            } else {
                                Alert.alert("Error", result.data?.[0]?.retstr || "Confirmation failed");
                            }
                        } catch (err: any) {
                            Alert.alert("Error", err.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: ScannedItem }) => (
        <View style={styles.row}>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.barcode}</Text>
            <View style={{ flex: 1.5 }}>
                <Text style={styles.cellMain}>{item.model}</Text>
                <Text style={styles.cellSub}>{item.color}</Text>
            </View>
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.qty}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Inventory Management</Text>
                <View style={styles.headerStats}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Scanned Qty</Text>
                        <Text style={styles.statValue}>{totalQty}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: verticalScale(20) }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Inventory Order</Text>
                        <View style={styles.pickerContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.orderList}>
                                    {orders.map((order) => (
                                        <TouchableOpacity
                                            key={order.inventoryNo}
                                            style={[
                                                styles.orderChip,
                                                selectedOrder === order.inventoryNo && styles.orderChipSelected
                                            ]}
                                            onPress={() => {
                                                setSelectedOrder(order.inventoryNo);
                                                fetchOrderDetails(order.inventoryNo);
                                            }}
                                        >
                                            <Text style={[
                                                styles.orderChipText,
                                                selectedOrder === order.inventoryNo && styles.orderChipTextSelected
                                            ]}>
                                                {order.inventoryNo}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Type</Text>
                            <Text style={styles.infoValue}>{inventoryType || "-"}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Model</Text>
                            <Text style={styles.infoValue}>{model || "-"}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Status</Text>
                            <Text style={[
                                styles.infoValue,
                                status.toLowerCase() === "finish" ? { color: "#10B981" } : { color: "#F59E0B" }
                            ]}>
                                {status || "-"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(4) }}>
                            <Text style={styles.label}>Scan Barcode (Pallet/Box/SN)</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowKeyboard(!showKeyboard);
                                    setTimeout(() => barcodeInputRef.current?.focus(), 100);
                                }}
                                style={styles.keyboardToggle}
                            >
                                <Text style={styles.keyboardToggleText}>
                                    {showKeyboard ? "⌨️ Hide Keyboard" : "⌨️ Show Keyboard"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            ref={barcodeInputRef}
                            style={styles.input}
                            value={barcode}
                            onChangeText={setBarcode}
                            placeholder="Scan or enter barcode..."
                            onSubmitEditing={(e) => handleScan(e.nativeEvent.text)}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            showSoftInputOnFocus={showKeyboard}
                            blurOnSubmit={false}
                            onBlur={ensureFocus}
                        />
                    </View>
                </View>

                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Barcode</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>Model/Color</Text>
                    <Text style={[styles.headerCell, { flex: 0.5 }]}>Qty</Text>
                </View>

                {loading && scannedItems.length === 0 ? (
                    <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: verticalScale(40) }} />
                ) : (
                    <ScrollView
                        style={{ height: verticalScale(120) }}
                        nestedScrollEnabled={true}
                    >
                        {scannedItems.length > 0 ? (
                            scannedItems.map((item) => (
                                <View key={item.id}>
                                    {renderItem({ item })}
                                </View>
                            ))
                        ) : (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>No items scanned yet</Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                <View style={styles.actions}>
                    {showConfirmBtn && (
                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            <Text style={styles.buttonText}>All Finish</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.exitButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Exit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const { width, height } = Dimensions.get("window");

const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 667) * size;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: {
        backgroundColor: "#1E1B4B",
        padding: scale(16),
        borderBottomLeftRadius: scale(24),
        borderBottomRightRadius: scale(24),
    },
    headerTitle: {
        color: "#FFF",
        fontSize: scale(18),
        fontWeight: "900",
        marginBottom: verticalScale(12),
    },
    headerStats: { flexDirection: "row" },
    statBox: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", padding: scale(10), borderRadius: scale(12) },
    statLabel: { color: "#A5B4FC", fontSize: scale(9), textTransform: "uppercase", fontWeight: "700" },
    statValue: { color: "#FFF", fontSize: scale(16), fontWeight: "800", marginTop: verticalScale(2) },
    content: { flex: 1, padding: scale(12) },
    formCard: {
        backgroundColor: "#FFF",
        padding: scale(12),
        borderRadius: scale(16),
        marginBottom: verticalScale(12),
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputGroup: { marginBottom: verticalScale(10) },
    label: { fontSize: scale(10), fontWeight: "700", color: "#64748B", marginBottom: verticalScale(4), textTransform: "uppercase" },
    pickerContainer: { height: verticalScale(40), justifyContent: "center" },
    orderList: { flexDirection: "row", gap: scale(6) },
    orderChip: { paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: scale(20), backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0" },
    orderChipSelected: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
    orderChipText: { fontSize: scale(11), fontWeight: "600", color: "#475569" },
    orderChipTextSelected: { color: "#FFF" },
    infoGrid: { flexDirection: "row", gap: scale(6), marginBottom: verticalScale(8) },
    infoBox: { flex: 1, backgroundColor: "#F8FAFC", padding: scale(8), borderRadius: scale(10), borderWidth: 1, borderColor: "#F1F5F9" },
    infoLabel: { fontSize: scale(8), color: "#94A3B8", fontWeight: "700", textTransform: "uppercase" },
    infoValue: { fontSize: scale(10), color: "#1E293B", fontWeight: "700", marginTop: verticalScale(2) },
    input: { backgroundColor: "#F1F5F9", height: verticalScale(40), borderRadius: scale(10), paddingHorizontal: scale(12), fontSize: scale(13), color: "#1E293B", fontWeight: "600" },
    tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", padding: scale(8), borderRadius: scale(10), marginBottom: verticalScale(6) },
    headerCell: { fontSize: scale(9), fontWeight: "900", color: "#64748B", textAlign: "center", textTransform: "uppercase" },
    row: {
        flexDirection: "row",
        height: verticalScale(40),
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        backgroundColor: "#FFF",
        borderRadius: scale(8),
        marginBottom: verticalScale(2),
        alignItems: "center"
    },
    cell: { fontSize: scale(10), color: "#334155", textAlign: "center", fontWeight: "600" },
    cellMain: { fontSize: scale(10), color: "#1E293B", fontWeight: "700", textAlign: "center" },
    cellSub: { fontSize: scale(9), color: "#64748B", textAlign: "center" },
    actions: { marginTop: verticalScale(12), gap: verticalScale(8) },
    confirmButton: { backgroundColor: "#10B981", padding: verticalScale(12), borderRadius: scale(10), alignItems: "center" },
    exitButton: { backgroundColor: "#EF4444", padding: verticalScale(12), borderRadius: scale(10), alignItems: "center" },
    buttonText: { color: "#FFF", fontWeight: "900", fontSize: scale(13) },
    keyboardToggle: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(6),
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    keyboardToggleText: {
        fontSize: scale(9),
        fontWeight: '700',
        color: '#4F46E5',
    },
});

