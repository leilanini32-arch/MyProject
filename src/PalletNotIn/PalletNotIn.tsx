import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StatusBar,
    Alert,
    Image,
    Dimensions,
    ScrollView,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PalletItem {
    id: string;
    fxh: string;
    palletCode: string;
    qty: string;
    model: string;
    color: string;
}

export default function PalletNotIn({ navigation }: any) {
    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_userName ,operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,} = global;
    const BASE_URL = gsURL;
    const [token, setToken] = useState("");

    const [loading, setLoading] = useState(true);
    const [pallets, setPallets] = useState<PalletItem[]>([]);
    const [totalQty, setTotalQty] = useState(0);
    const [selectedItem, setSelectedItem] = useState<PalletItem | null>(null);

    useEffect(() => {
        const loadToken = async () => {
            const t = await AsyncStorage.getItem("userToken");
            console.log("TOKEN IN Allocateout", t);
            if (t) setToken(t);
        };

        loadToken();
    }, []);

    const fetchPallets = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/PalletNotIn`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
                body: JSON.stringify({ 
                    operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,
                    factoryCode: gs_factoryCode }),
            });

            if (response.status === 401) {
                Alert.alert("Unauthorized", "Token expired or invalid.");
                return;
            }

            if (response.status === 403) {
                Alert.alert("Access Denied", "You do not have permission.");
                return;
            }

            const result = await response.json();

            if (result.code === 500) {
                Alert.alert("Error", result.message);
                navigation.goBack();
                return;
            }
            if (result.message === "success" && result.data && result.data.length > 0) {
                let total = 0;
                const mapped = result.data.map((item: any, index: number) => {
                    total += parseInt(item.qty || "0");
                    return {
                        id: index.toString(),
                        fxh: item.fxh,
                        palletCode: item.palletCode,
                        qty: item.qty,
                        model: item.model,
                        color: item.color,
                    };
                });
                setPallets(mapped);
                setTotalQty(total);
            } else {
                setPallets([]);
                setTotalQty(0);
                Alert.alert("Notice", "There is no product in the Pallet!");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    }, [gs_factoryCode, BASE_URL, token]);

    useEffect(() => {
        if (token) {
            fetchPallets();
        }
    }, [fetchPallets, token]);


    const renderItem = ({ item }: { item: PalletItem }) => {
        const isSelected = selectedItem?.id === item.id;
        return (
            <TouchableOpacity
                style={[styles.tableRow, isSelected && styles.selectedRow]}
                onPress={() => setSelectedItem(item)}
            >
                <Text style={[styles.cell, { width: 50 }]}>{item.fxh}</Text>
                <Text style={[styles.cell, { width: 150 }]}>{item.palletCode}</Text>
                <Text style={[styles.cell, { width: 60 }]}>{item.qty}</Text>
                <Text style={[styles.cell, { width: 120 }]}>{item.model}</Text>
                <Text style={[styles.cell, { width: 100 }]}>{item.color}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Image
                            source={require("../../assets/logo/left.png")}
                            style={styles.returnLogo}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pallets Not In</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.userNameText}>{gs_userName}</Text>
                </View>
            </View>

            <View style={styles.statsCard}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total</Text>
                    <Text style={styles.statValue}>{totalQty}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.tableCard}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.headerCell, { width: 50 }]}>No</Text>
                                <Text style={[styles.headerCell, { width: 150 }]}>Pallet Code</Text>
                                <Text style={[styles.headerCell, { width: 60 }]}>Qty</Text>
                                <Text style={[styles.headerCell, { width: 120 }]}>Model</Text>
                                <Text style={[styles.headerCell, { width: 100 }]}>Color</Text>
                            </View>

                            {loading ? (
                                <ActivityIndicator size="large" color="#0052cc" style={{ marginTop: 40 }} />
                            ) : (
                                <FlatList
                                    data={pallets}
                                    renderItem={renderItem}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    onRefresh={fetchPallets}
                                    refreshing={loading}
                                    scrollEnabled={false}
                                />
                            )}
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.btnPrimary, !selectedItem && styles.btnDisabled]}
                        onPress={() => {
                            if (selectedItem) {
                                navigation.navigate("PalletNotInBox", { palletCode: selectedItem.palletCode });
                            } else {
                                Alert.alert("Notice", "Please select a pallet first.");
                            }
                        }}
                        disabled={!selectedItem}
                    >
                        <Text style={styles.btnTextPrimary}>Barcode Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const { width } = Dimensions.get("window");
const isSmallDevice = width < 360;
const scale = (size: number) => (width / 375) * size;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: {
        backgroundColor: "#0052cc",
        paddingHorizontal: width * 0.05,
        height: scale(56),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 4,
    },
    headerLeft: { flexDirection: "row", alignItems: "center" },
    returnLogo: { width: scale(24), height: scale(24), marginRight: 10, tintColor: "#FFFFFF" },
    headerTitle: { color: "#FFFFFF", fontSize: isSmallDevice ? scale(14) : scale(16), fontWeight: "900" },
    headerRight: { flexDirection: "row", alignItems: "center" },
    userNameText: { color: "#FFFFFF", fontSize: scale(12), fontWeight: "700", marginRight: 1 },
    statsCard: { padding: 16, flexDirection: 'row', gap: 10 },
    statBox: {
        flex: 1,
        backgroundColor: "#0052cc",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    statLabel: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
    statValue: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
    content: { flex: 1 },
    tableCard: { flex: 1, backgroundColor: "#FFF", marginHorizontal: 16, borderRadius: 16, overflow: "hidden", elevation: 2, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: -1 },
    tableHeader: { flexDirection: "row", backgroundColor: "#0052cc", paddingVertical: 10 },
    headerCell: { fontSize: 10, fontWeight: "800", color: "#FFFFFF", textAlign: "center", textTransform: "uppercase" },
    tableRow: { flexDirection: "row", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", alignItems: "center" },
    selectedRow: { backgroundColor: "#E0F2FE" },
    cell: { fontSize: 11, color: "#334155", textAlign: "center", fontWeight: "600" },
    cellMain: { fontSize: 11, color: "#1E293B", fontWeight: "700", textAlign: "center" },
    cellSub: { fontSize: 10, color: "#64748B", textAlign: "center" },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    actionBtn: { height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    btnPrimary: { backgroundColor: '#0052cc' },
    btnDisabled: { backgroundColor: '#0052cc' },
    btnTextPrimary: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
