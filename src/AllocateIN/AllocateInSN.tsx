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

interface PalletSNDetail {

    id: string;
    fxh: string;
    SN: string;
    model: string;
    color: string;
    imeiCode1: string;
    imeiCode2: string;
    imeiCode3: string;
    createDate: string;
}

export default function AllocateInSN({ navigation, route }: any) {
    const { allocateCode, palletCode, boxCode } = route.params || {};
    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_wareCode } = global;
    const BASE_URL = gsURL;

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<PalletSNDetail[]>([]);
    const [title, setTitle] = useState("");
    const [qtyTotal, setQtyTotal] = useState(0);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateInPalletSN`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    factoryCode: gs_factoryCode,
                    wareHouseCode: gs_wareCode,
                    allocateCode: allocateCode,
                    palletCode: palletCode,
                    boxCode: boxCode,
                }),
            });
            const result = await response.json();
            console.log("resultat de sn", result);
            if (result.message === 'success' && result.data && result.data.length > 0) {
                let fmodel = result.data[0].model || "";
                let fcolor = result.data[0].color || "";
                setTitle(`Pallet: ${palletCode} Box: ${boxCode} | ${fmodel} ${fcolor}`);

                const mapped = result.data.map((item: any, index: number) => ({
                    id: index.toString(),
                    fxh: item.fxh,
                    SN: item.sn,
                    model: item.model,
                    color: item.color,
                    imeiCode1: item.imeiCode1,
                    imeiCode2: item.imeiCode2,
                    imeiCode3: item.imeiCode3,
                    createDate: item.createDate,
                }));
                setDetails(mapped);
                setQtyTotal(mapped.length);
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
    }, [allocateCode, palletCode, boxCode, gs_factoryCode, gs_wareCode, BASE_URL, navigation]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const renderItem = ({ item }: { item: PalletSNDetail }) => (
        <View style={styles.row}>
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.fxh}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.SN}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.imeiCode1}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.imeiCode2}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.imeiCode3}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.createDate}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Allocation SN Details</Text>
                <Text style={styles.headerSubtitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>Total Qty: {qtyTotal}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, { flex: 0.5 }]}>FXH</Text>
                    <Text style={[styles.headerCell, { flex: 1.5 }]}>SN</Text>
                    <Text style={[styles.headerCell, { flex: 1.2 }]}>IMEI1</Text>
                    <Text style={[styles.headerCell, { flex: 1.2 }]}>IMEI2</Text>
                    <Text style={[styles.headerCell, { flex: 1.2 }]}>IMEI3</Text>
                    <Text style={[styles.headerCell, { flex: 1.2 }]}>Date</Text>
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
