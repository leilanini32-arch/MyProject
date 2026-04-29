import React, { useState, useCallback, useEffect, useRef } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    ActivityIndicator,
    Image,
    Dimensions,
    DeviceEventEmitter
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RowType = {
    boxCode: string;
    model: string;
    color: string;
    boxQty: string;
};

export default function AllocateFrm({ navigation, route }: any) {
    const { allocateCode } = route.params || { allocateCode: "" };

    const global = useGlobal();
    const { gsURL, gs_factoryCode, gs_wareCode, gs_wareType, gs_classCode, gs_groupCode, gs_workdate, gs_userCode, gs_userName,
        operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,
    } = global;
    const BASE_URL = gsURL;
    const [token, setToken] = useState("");

    const [barcode, setBarcode] = useState("");
    const [toCkName, setToCkName] = useState("");
    const [totalQty, setTotalQty] = useState("");
    const [tableData, setTableData] = useState<RowType[]>([]);
    const [loading, setLoading] = useState(false);
    const showKeyboard = false;

    const inputRef = useRef<TextInput>(null);

    const ensureFocus = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };


    useEffect(() => {
        const loadToken = async () => {
            const t = await AsyncStorage.getItem("userToken");
            console.log("TOKEN IN Allocateout", t);
            if (t) setToken(t);
        };

        loadToken();
    }, []);



    const fetchAllocateCheck = useCallback(async () => {
        if (!allocateCode) return;
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateCheck`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
                body: JSON.stringify({
                    operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,
                    FactoryCode: gs_factoryCode,
                    allocateCode: allocateCode,
                    FromWareHouse: gs_wareCode,
                }),
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
            if (result.message === 'success' && result.data) {
                const data = result.data;
                setToCkName(data.tockName || "");
            } else {
                Alert.alert("Error", result.message || "Data handling exceptions, please check!");
                navigation.goBack();
            }
        } catch (_) {
            Alert.alert("Error", "Failed to fetch allocate details");
        } finally {
            setLoading(false);
        }
    }, [allocateCode, gs_factoryCode, gs_wareCode, BASE_URL, token, navigation]);

    useEffect(() => {
        if (token) {
            fetchAllocateCheck();
        }
    }, [token, fetchAllocateCheck]);


    useEffect(() => {
        if (route.params?.confirmedData) {
            const { barCode, scanType } = route.params.confirmedData;

            processInsert(barCode, scanType);
            navigation.setParams({ confirmedData: null });
        }
    }, [route.params?.confirmedData]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            inputRef.current?.focus();
        });
        return unsubscribe;
    }, [navigation]);

    const processInsert = useCallback(async (barCode: string, scanType: string) => {
        console.log("Entering processInsert with:", barCode, scanType);
        try {
            const response = await fetch(`${BASE_URL}/api/AllocateInsert`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
                body: JSON.stringify({
                    operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,
                    factoryCode: gs_factoryCode,
                    wareHouseCode: gs_wareCode,
                    wareType: gs_wareType,
                    allocateCode: allocateCode,
                    barCode: barCode,
                    scanType: scanType,
                    classesCode: gs_classCode,
                    groupCode: gs_groupCode,
                    workdate: gs_workdate,
                    createUser: gs_userCode,
                })
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
            console.log("allocateout", result);
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
                    } else {
                        Alert.alert("Error", dataList[0].retstr);
                    }
                }
            } else {
                Alert.alert("Error", result.message || "Failed to insert data");
            }
        } catch (_) {
            Alert.alert("Error", "Network error during insertion");
        } finally {
            setBarcode("");
            inputRef.current?.focus();
        }
    }, [BASE_URL, gs_factoryCode, gs_wareCode, gs_wareType, allocateCode, gs_classCode, gs_groupCode, gs_workdate, gs_userCode, token]);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener(
            "ON_ALLOCATE_CONFIRM",
            (data) => {
                console.log("received allocate confirm", data);

                processInsert(data.barCode, data.scanType);
            }
        );

        return () => sub.remove();
    }, [processInsert]);



    const handleBarcodeSubmit = async (text?: any) => {
        const sn = (typeof text === 'string' ? text : barcode).toUpperCase().trim();
        if (!sn) return;

        setLoading(true);
        try {
            // 1. Get Barcode Type
            const typeResponse = await fetch(`${BASE_URL}/api/BarcodeType`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
                body: JSON.stringify({ 
                    operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,
                    factoryCode: gs_factoryCode, scanCode: sn }),
            });

            if (typeResponse.status === 401) {
                Alert.alert("Unauthorized", "Token expired or invalid.");
                return;
            }

            if (typeResponse.status === 403) {
                Alert.alert("Access Denied", "You do not have permission.");
                return;
            }
            const typeResult = await typeResponse.json();

            let scanType = typeResult.message === 'success' && typeResult.data.scanType ? typeResult.data.scanType : "";
            console.log("barcodetype", scanType);
            //change it after
            if (!scanType) {
                scanType = "sn";
                /*Alert.alert("Error", "Unknown barcode type");
                setBarcode("");
                inputRef.current?.focus();
                return;*/
            }

            // 2. Confirmation if needed
            if (scanType === "pallet" || scanType === "box") {
                navigation.navigate("AllocateSNConfirmBox", {
                    fromWareHouseCode: gs_wareCode,
                    barCode: sn,
                    scanType: scanType
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
                    showConfirm: true
                });
                setBarcode("");
                return;
            }

            await processInsert(sn, scanType);
        } catch (_) {
            Alert.alert("Error", "Failed to process barcode");
        } finally {
            setLoading(false);
        }
    };

    const handleBarcodeChange = (text: string) => {
        // Some scanners append a newline or carriage return instead of triggering onSubmitEditing
        if (text.endsWith('\n') || text.endsWith('\r')) {
            handleBarcodeSubmit(text.trim());
        } else {
            setBarcode(text);
        }
    };

    const handleKeyPress = (e: any) => {
        // Handle Tab key which some scanners use as a suffix
        if (e.nativeEvent.key === 'Tab') {
            handleBarcodeSubmit();
        }
    };



    const renderItem = useCallback(({ item, index }: { item: RowType; index: number }) => (
        <View key={index} style={styles.tableRow}>
            <Text style={[styles.cell, styles.width120]}>{item.boxCode}</Text>
            <Text style={[styles.cell, styles.width120]}>{item.model}</Text>
            <Text style={[styles.cell, styles.width100]}>{item.color}</Text>
            <Text style={[styles.cell, styles.width60]}>{item.boxQty}</Text>
        </View>
    ), []);

    const handleReturn = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={handleReturn} activeOpacity={0.7}>
                        <Image
                            source={require("../../assets/logo/left.png")}
                            style={styles.returnLogo}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Allocate Scanning</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.userNameText}>{gs_userName}</Text>
                </View>
            </View>

            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.mb8}>
                        <View style={styles.inputRow}>
                            <Text style={styles.labelNoMargin}>TO WH</Text>
                            <Text style={styles.valueText}>{toCkName}</Text>
                        </View>

                        <View style={styles.inputRow}>
                            <Text style={styles.labelNoMargin}>TOTAL QTY</Text>
                            <Text style={styles.valueText}>{totalQty}</Text>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            value={barcode}
                            onChangeText={handleBarcodeChange}
                            onSubmitEditing={(e) => handleBarcodeSubmit(e.nativeEvent.text)}
                            onKeyPress={handleKeyPress}
                            placeholder=" Barcode"
                            placeholderTextColor="#334155"

                            autoFocus={true}
                            showSoftInputOnFocus={showKeyboard}
                            blurOnSubmit={false}
                            onBlur={ensureFocus}
                        />
                    </View>
                </View>

                <View style={styles.tableCard}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.headerCell, styles.width120]}>Box Code</Text>
                                <Text style={[styles.headerCell, styles.width120]}>Model</Text>
                                <Text style={[styles.headerCell, styles.width100]}>Color</Text>
                                <Text style={[styles.headerCell, styles.width60]}>Qty</Text>
                            </View>
                            <ScrollView style={styles.flex1}>
                                {tableData.length === 0 ? (
                                    <Text style={styles.emptyTextWithWidth}>No items scanned yet</Text>
                                ) : (
                                    tableData.map((row, index) => (
                                        <React.Fragment key={row.boxCode + "_" + index}>
                                            {renderItem({ item: row, index })}
                                        </React.Fragment>
                                    ))
                                )}
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('AllocateSNBox', { allocateCode })}
                    >
                        <Text style={styles.actionButtonText}>Barcode Details</Text>
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

const { width } = Dimensions.get("window");
const isSmallDevice = width < 360;
const scale = (size: number) => (width / 375) * size;

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
    header: {
        backgroundColor: "#0052cc",
        paddingHorizontal: width * 0.05,
        height: scale(56),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 4,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    returnLogo: {
        width: scale(24),
        height: scale(24),
        marginRight: 10,
        tintColor: "#FFFFFF",
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: isSmallDevice ? scale(14) : scale(16),
        fontWeight: "900",
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    userNameText: {
        color: "#FFFFFF",
        fontSize: scale(12),
        fontWeight: "700",
        marginRight: 1,
    },
    container: { flex: 1, padding: 10 },
    card: { backgroundColor: "#FFF", borderRadius: 16, padding: 10, marginBottom: 8, elevation: 2, borderWidth: 1, borderColor: "#0052cc" },
    inputGroup: { marginBottom: 1 },
    label: { fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 4, textTransform: "uppercase" },
    input: { backgroundColor: "#e2f0eeff", padding: 3, borderRadius: 10, fontSize: 12, color: "#334155", borderWidth: 1, borderColor: "#0052cc", height: 32 },
    disabledInput: { backgroundColor: "#0052cc", color: "#64748B" },
    tableHeader: { flexDirection: "row", backgroundColor: "#0052cc", paddingVertical: 10 },
    headerCell: { fontSize: 10, fontWeight: "800", color: "#FFFFFF", textAlign: "center", textTransform: "uppercase" },
    tableRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    cell: { fontSize: 11, color: "#334155", textAlign: "center", fontWeight: "600" },
    emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 40, fontStyle: "italic" },
    actions: { flexDirection: "row", gap: 12, marginTop: 8 },
    actionButton: {
        flex: 1,
        backgroundColor: "#4F46E5",
        padding: 8,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    actionButtonText: { color: "#fff", fontWeight: "900", fontSize: 15 },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.7)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    mb8: { marginBottom: 8 },
    inputRow: { backgroundColor: '#0052cc', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 4, marginBottom: 4, borderRadius: 10, borderWidth: 1, borderColor: "#CBD5E1" },
    labelNoMargin: { fontSize: 11, fontWeight: "700", color: "#FFFFFF", marginBottom: 0, textTransform: "uppercase" },
    valueText: { fontSize: 12, color: "#FFFFFF", fontWeight: "700" },
    tableCard: { flex: 1, backgroundColor: "#FFF", borderRadius: 16, overflow: "hidden", elevation: 2, borderWidth: 1, borderColor: "#0052cc", marginBottom: 12 },
    width120: { width: 120 },
    width100: { width: 100 },
    width60: { width: 60 },
    flex1: { flex: 1 },
    emptyTextWithWidth: { textAlign: "center", color: "#94A3B8", marginTop: 40, fontStyle: "italic", width: 400 },
});
