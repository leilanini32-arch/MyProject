import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    StatusBar,
    ActivityIndicator,
    ListRenderItem,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";

interface SNDetail {
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

export default function AllocateSN({ navigation, route }: any) {
    const { allocateCode, palletCode: initialPalletCode, boxCode: initialBoxCode } = route.params || {};
    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_wareCode } = global;
    const BASE_URL = gsURL;

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<SNDetail[]>([]);
    const [title, setTitle] = useState("");

    useEffect(() => {
        fetchSNDetails();
    }, []);

    const fetchSNDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocatePalletSN`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    FactoryCode: gs_factoryCode,
                    WareHouseCode: gs_wareCode,
                    AllocateCode: allocateCode,
                    PalletCode: initialPalletCode || "",
                    BoxCode: initialBoxCode || ""
                })
            });

            const result = await response.json();
            console.log("allocatesn ", result)
            if (result.message === 'success' && result.data && result.data.length > 0) {
                const mappedData = result.data.map((row: any, index: number) => ({
                    id: index.toString(),
                    fxh: row.fxh?.toString(),
                    SN: row.sn,
                    model: row.model,
                    color: row.color,
                    imeiCode1: row.imeiCode1,
                    imeiCode2: row.imeiCode2,
                    imeiCode3: row.imeiCode3,
                    createDate: row.createDate,
                }));

                setItems(mappedData);
                const first = result.data[0];
                setTitle(`${first.model} ${first.color}`);
            } else {
                Alert.alert("Message", result.message || "There is no product in the Pallet!");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load SN details");
        } finally {
            setLoading(false);
        }
    };

    const renderItem: ListRenderItem<SNDetail> = ({ item, index }) => (
        <View
            style={[
                styles.row,
                index % 2 === 0 ? styles.rowEven : styles.rowOdd,
            ]}
        >
            <Text style={[styles.cell, styles.cellNo]}>{index + 1}</Text>
            <Text style={[styles.cell, styles.cellSN]}>{item.SN}</Text>
            <Text style={[styles.cell, styles.cellIMEI]}>{item.imeiCode1}</Text>
            <Text style={[styles.cell, styles.cellDate]}>{item.createDate}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={styles.title}>SN Details</Text>
                <Text style={styles.subtitle}>Pallet: {initialPalletCode} | Box: {initialBoxCode}</Text>
                <Text style={styles.modelText}>{title}</Text>
            </View>

            <View style={styles.summaryCard}>
                <View>
                    <Text style={styles.summaryLabel}>Total Units</Text>
                    <Text style={styles.summaryValue}>{items.length}</Text>
                </View>
            </View>

            <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.cellNo]}>No</Text>
                <Text style={[styles.headerCell, styles.cellSN]}>SN</Text>
                <Text style={[styles.headerCell, styles.cellIMEI]}>IMEI 1</Text>
                <Text style={[styles.headerCell, styles.cellDate]}>Date</Text>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {loading ? <ActivityIndicator color="#2563eb" /> : <Text style={styles.emptyText}>No data available</Text>}
                    </View>
                }
            />

            <View style={styles.actionPanel}>
                <TouchableOpacity
                    style={styles.exitBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.exitText}>Close Terminal</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 2,
    },
    modelText: {
        fontSize: 13,
        color: '#2563eb',
        fontWeight: '700',
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    summaryLabel: {
        fontSize: 11,
        color: '#94a3b8',
        textTransform: 'uppercase',
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        marginHorizontal: 10,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    headerCell: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    listContent: {
        backgroundColor: '#fff',
        marginHorizontal: 10,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        minHeight: 100,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    rowEven: { backgroundColor: '#fff' },
    rowOdd: { backgroundColor: '#f8fafc' },
    cell: {
        fontSize: 11,
        color: '#334155',
        fontWeight: '600',
        textAlign: 'center',
    },
    cellNo: { flex: 0.5 },
    cellSN: {
        flex: 2,
        textAlign: 'left',
        paddingLeft: 8,
        color: '#2563eb',
        fontWeight: '800',
    },
    cellIMEI: { flex: 1.5 },
    cellDate: { flex: 1.5 },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: 14,
    },
    actionPanel: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    exitBtn: {
        alignSelf: 'center',
        padding: 10,
    },
    exitText: {
        color: '#94a3b8',
        fontWeight: '700',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
