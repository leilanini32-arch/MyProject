import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";

interface AllocateInItem {
    systemAllocateCode: string;
    model: string;
    color: string;
    qty: number;
    outqty: number;
    inqty: number;
    cyqty: number;
    fromWareHouse: string;
    toWareHouse: string;
    allocateCode: string;
}

export default function AllocateInNO({ navigation }: any) {
    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_wareCode } = global;
    const BASE_URL = gsURL;

    const [sn, setSn] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [items, setItems] = useState<AllocateInItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [f_systemAllocateCode, setFSystemAllocateCode] = useState("");
    const [showKeyboard, setShowKeyboard] = useState(false);

    const snRef = useRef<TextInput>(null);

    const ensureFocus = () => {
        if (snRef.current) {
            snRef.current.focus();
        }
    };

    useEffect(() => {
        snRef.current?.focus();
    }, []);

    const fetchAllocateInModelList = async (systemAllocateCode: string) => {
        setErrorMsg("");
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateInModel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    FactoryCode: gs_factoryCode,
                    SystemAllocateCode: systemAllocateCode,
                }),
            });

            const result = await response.json();
            const newItems: AllocateInItem[] = [];
            let tock = "";

            if (result && result.message === 'success' && result.data) {
                result.data.forEach((row: any) => {
                    newItems.push({
                        systemAllocateCode: systemAllocateCode,
                        model: row.model,
                        color: row.color,
                        qty: parseInt(row.qty),
                        outqty: parseInt(row.outqty),
                        inqty: parseInt(row.inqty),
                        cyqty: parseInt(row.cyqty),
                        fromWareHouse: row.fromWareHouse,
                        toWareHouse: row.toWareHouse,
                        allocateCode: row.allocateCode,
                    });
                    tock = row.toWareHouse;
                });
            }

            setItems(newItems);

            if (tock !== "" && tock !== gs_wareCode) {
                setErrorMsg("To WareHouse Must be Login WareHouse " + gs_wareCode);
                setSn("");
                setItems([]);
                setFSystemAllocateCode("");
                snRef.current?.focus();
                console.log("API toWareHouse:", tock);
                console.log("Login wareHouse:", gs_wareCode);
                return;
            }

            setFSystemAllocateCode(systemAllocateCode);

        } catch (err: any) {
            setErrorMsg("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSnSubmit = () => {
        const code = sn.toUpperCase().trim();
        if (code.length > 0) {
            fetchAllocateInModelList(code);

        }
    };

    const handleChoice = () => {
        if (selectedIndex !== null && items[selectedIndex]) {
            const allocateCode = items[selectedIndex].allocateCode;
            navigation.navigate('AllocateInFrm', { allocateCode });
        } else if (items.length > 0) {
            navigation.navigate('AllocateInFrm', { allocateCode: items[0].allocateCode });
        } else {
            setErrorMsg("Please select an item first");
        }
    };

    const renderItem = ({ item, index }: { item: AllocateInItem; index: number }) => {
        let textColor = "#000";
        if (item.cyqty > 0) {
            textColor = item.inqty > 0 ? "blue" : "red";
        }
        const isSelected = selectedIndex === index;

        return (
            <TouchableOpacity
                style={[styles.row, isSelected && styles.selectedRow]}
                onPress={() => setSelectedIndex(index)}
            >
                <Text style={[styles.cell, { color: textColor }]}>{item.systemAllocateCode}</Text>
                <Text style={[styles.cell, { color: textColor }]}>{item.model}</Text>
                <Text style={[styles.cell, { color: textColor }]}>{item.color}</Text>
                <Text style={[styles.cell, { color: textColor }]}>{item.qty}</Text>
                <Text style={[styles.cell, { color: textColor }]}>{item.outqty}</Text>
                <Text style={[styles.cell, { color: textColor }]}>{item.inqty}</Text>
                <Text style={[styles.cell, { color: textColor }]}>{item.cyqty}</Text>
                <Text style={[styles.cell, { color: textColor }]}>{item.fromWareHouse}</Text>
                <Text style={[styles.cell, { color: textColor }]}>{item.toWareHouse}</Text>
                <Text style={[styles.cell, { color: textColor }]}>{item.allocateCode}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={styles.headerTitle}>Allocate In Scanning</Text>
                        <Text style={styles.headerSubtitle}>Scan Allocate NO</Text>
                    </View>
                    {loading && <ActivityIndicator color="#FFF" />}
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={styles.cardTitle}>Scan Allocate Code</Text>
                        <TouchableOpacity 
                            onPress={() => {
                                setShowKeyboard(!showKeyboard);
                                setTimeout(() => snRef.current?.focus(), 100);
                            }}
                            style={styles.keyboardToggle}
                        >
                            <Text style={styles.keyboardToggleText}>
                                {showKeyboard ? "⌨️ Hide Keyboard" : "⌨️ Show Keyboard"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                    <TextInput
                        ref={snRef}
                        style={styles.input}
                        value={sn}
                        onChangeText={setSn}
                        onSubmitEditing={handleSnSubmit}
                        placeholder="Scan or enter Allocate Code"
                        autoCapitalize="characters"
                        showSoftInputOnFocus={showKeyboard}
                        blurOnSubmit={false}
                        onBlur={ensureFocus}
                    />
                </View>

                <View style={[styles.card, { flex: 1 }]}>
                    <Text style={styles.cardTitle}>Allocate Details</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View>
                            <View style={[styles.row, styles.tableHeader]}>
                                {["Sys Code", "Model", "Color", "QTY", "Out", "In", "Diff", "From", "To", "Code"].map((h) => (
                                    <Text key={h} style={[styles.cell, styles.headerCell]}>{h}</Text>
                                ))}
                            </View>
                            <ScrollView style={{ flex: 1 }}>
                                {items.length === 0 ? (
                                    <Text style={styles.empty}>Waiting for Scanning...</Text>
                                ) : (
                                    items.map((item, index) => renderItem({ item, index }))
                                )}
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleChoice}>
                        <Text style={styles.primaryButtonText}>Choice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.secondaryButtonText}>Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: {
        backgroundColor: "#1E1B4B",
        padding: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
    headerSubtitle: { color: "#A5B4FC", fontSize: 12, marginTop: 4 },
    content: { flex: 1, padding: 15 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    cardTitle: { fontSize: 13, fontWeight: "900", marginBottom: 10, color: "#475569", textTransform: "uppercase" },
    input: {
        backgroundColor: "#F1F5F9",
        padding: 10,
        borderRadius: 10,
        marginTop: 4,
        fontSize: 14,
        color: "#000",
        borderWidth: 1,
        borderColor: "#CBD5E1",
    },
    tableHeader: { backgroundColor: "#F1F5F9", borderRadius: 8, marginBottom: 5 },
    row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    cell: { width: 90, padding: 12, fontSize: 11, textAlign: "center", fontWeight: "600" },
    headerCell: { fontWeight: "900", fontSize: 10, color: "#64748B", textTransform: "uppercase" },
    empty: { textAlign: "center", padding: 40, color: "#94A3B8", fontStyle: "italic", width: 900 },
    actions: { flexDirection: 'row', gap: 12, marginTop: 10 },
    primaryButton: { flex: 1, backgroundColor: "#2563EB", padding: 15, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    primaryButtonText: { color: "#fff", fontWeight: "900", fontSize: 16 },
    secondaryButton: { flex: 1, backgroundColor: "#FEE2E2", padding: 15, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#FECACA" },
    secondaryButtonText: { color: "#EF4444", fontWeight: "900", fontSize: 16 },
    errorText: { color: "#EF4444", fontSize: 12, marginBottom: 8, fontWeight: "700" },
    selectedRow: { backgroundColor: "#E0E7FF" },
    keyboardToggle: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    keyboardToggleText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4F46E5',
    },
});
