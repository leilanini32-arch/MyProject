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



export default function DeliveryFrm({ navigation, route }: any) {
  const { gsURL, setgs_gsURL } = useGlobal();
  const BASE_URL = gsURL;
  const { deliveryCode } = route.params || { deliveryCode: "" };

  const global = useGlobal();
  const [barcode, setBarcode] = useState("");
  const [toCkName, setToCkName] = useState("");
  const [totalQty, setTotalQty] = useState("");
  const [rows, setRows] = useState<RowType[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // Equivalent to Frm_Delivery_Load
  useEffect(() => {
    if (deliveryCode) {
      deliveryDeal(deliveryCode);
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [deliveryCode]);

  useEffect(() => {
    if (barcode === "") {
      inputRef.current?.focus();
    }
  }, [barcode]);

  const deliveryDeal = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/DeliveryCheck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factoryCode: global.gs_factoryCode,
          deliveryCode: code,
          wareHouseCode: global.gs_wareCode
        })
      });

      const result = await response.json();
      if (result.message == "success" && result.data) {
        const data = result.data;
        if (data.isok === "1") {
          setToCkName(data.ckName);
        } else {
          Alert.alert("Error", data.retstr || "Validation failed");
          console.log("message1", data.retstr);
          console.log("message1", data);
        }
      } else {
        Alert.alert("Error", result.message || "Data handling exceptions, please check!");
        console.log("message2", result.message);
        console.log("message2", result.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const getType = async (sn: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/BarcodeType`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factoryCode: global.gs_factoryCode,
          scanCode: sn
        })
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        console.log("message3", result);
        return result.data.scanType;

      }
      return "";
    } catch (error) {
      console.error(error);
      return "";
    }
  };



  const palletDeal = async (barCode: string, scanType: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/DeliveryInsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factoryCode: global.gs_factoryCode,
          wareHouseCode: global.gs_wareCode,
          deliveryCode: deliveryCode,
          barCode: barCode,
          scanType: scanType,
          classesCode: global.gs_classCode,
          groupCode: global.gs_groupCode,
          workdate: global.gs_workdate,
          createUser: global.gs_userCode
        })
      });

      const result = await response.json();
      if (result.code === 200 && result.data && result.data.length > 0) {
        const firstItem = result.data[0];
        setTotalQty(firstItem.totalQty);

        if (firstItem.isok !== "1") {
          Alert.alert("Error", firstItem.retstr || "Operation failed");
          console.log("Delivery error:", firstItem);
          return;
        }

        const newRows = result.data.map((item: any) => ({
          boxCode: item.boxCode,
          model: item.model,
          color: item.color,
          boxQty: item.boxQty
        }));
        setRows(newRows);
        console.log("message4", result);

        if (firstItem.isfinish === "1") {
          Alert.alert("Info", "The delivery of documents has already shipped completed!");
        }
      } else {
        Alert.alert("Error", result.message || "There is no product in the Pallet!");
        console.log("message44", result);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to process pallet");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!barcode.trim()) return;

    const sn = barcode.toUpperCase().trim();
    const scanType = await getType(sn);

    if (scanType === "pallet" || scanType === "box") {
      setBarcode(""); // Clear immediately like C#
      navigation.navigate('DeliverySNConfirmBox', {
        fromWareHouseCode: global.gs_wareCode,
        barCode: sn,
        scanType: scanType,
        onConfirm: () => {
          palletDeal(sn, scanType);

        }
      });
      return;
    }

    if (scanType === "sn") {
      setBarcode(""); // Clear immediately like C#
      navigation.navigate('DeliverySNConfirm', {
        fromWareHouseCode: global.gs_wareCode,
        palletCode: "",
        boxCode: "",
        SN: sn,
        scanType: scanType,
        showConfirm: true,
        onConfirm: () => {
          palletDeal(sn, scanType);
        }
      });
      return;
    }

    // Default processing if no specific confirm needed
    await palletDeal(sn, scanType);
    setBarcode("");
    inputRef.current?.focus();
  };

  const viewDetails = () => {
    navigation.navigate('DeliverySNBox', { deliveryCode });
  };

  const tableHeaders = ["Boxcode", "Model", "Color", "Qty"];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Warehouse Delivery</Text>
          {loading && <ActivityIndicator color="#FFF" />}
        </View>
        <Text style={styles.headerSubtitle}>Delivery: {deliveryCode || "N/A"}</Text>
        <Text style={styles.headerSubtitle}>To: {toCkName || "—"}</Text>
      </View>

      <View style={styles.container}>
        {/* Entry Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Entry Scanner</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scan Barcode (SN/Box/Pallet)</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={barcode}
              onChangeText={setBarcode}
              onSubmitEditing={handleScan}
              placeholder="Scan here..."
              autoFocus
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>To Warehouse</Text>
              <TextInput
                style={[styles.input, styles.filledInput]}
                value={toCkName}
                editable={false}
              />
            </View>

            <View style={[styles.inputGroup, { width: 100 }]}>
              <Text style={styles.label}>Total Qty</Text>
              <TextInput
                style={[styles.input, styles.filledInput]}
                value={totalQty}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View style={[styles.card, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Scan Details</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              <View style={styles.tableHeaderRow}>
                {tableHeaders.map((h) => (
                  <Text key={h} style={styles.headerCell}>
                    {h}
                  </Text>
                ))}
              </View>

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator>
                {rows.length > 0 ? (
                  rows.map((item, index) => (
                    <View key={index} style={styles.tableDataRow}>
                      <Text style={styles.cell}>{item.boxCode}</Text>
                      <Text style={styles.cell}>{item.model}</Text>
                      <Text style={styles.cell}>{item.color}</Text>
                      <Text style={styles.cell}>{item.boxQty}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No items scanned yet</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={viewDetails}
          >
            <Text style={styles.btnText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnTextSecondary}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, padding: 16, paddingBottom: 40 },
  header: {
    backgroundColor: "#1E1B4B",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  headerSubtitle: { color: "#A5B4FC", fontSize: 14, fontWeight: "600", marginTop: 4 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: { borderLeftWidth: 4, borderLeftColor: "#4F46E5", paddingLeft: 10, marginBottom: 20 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#475569", textTransform: "uppercase" },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6, marginLeft: 2 },
  input: {
    height: 50,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  filledInput: { backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", color: "#64748B" },
  rowInputs: { flexDirection: "row", alignItems: "flex-end" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 8, paddingVertical: 10 },
  headerCell: { width: 100, textAlign: "center", fontSize: 10, fontWeight: "800", color: "#64748B", textTransform: "uppercase" },
  tableDataRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  cell: { width: 100, textAlign: "center", paddingVertical: 15, fontSize: 12, color: "#334155", fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40, width: 400 },
  emptyText: { color: "#94A3B8", fontStyle: "italic", fontSize: 13 },
  actionContainer: { flexDirection: "row", gap: 12, marginTop: 10 },
  btn: { flex: 1, height: 55, borderRadius: 14, justifyContent: "center", alignItems: "center", elevation: 3 },
  btnPrimary: { backgroundColor: "#2563EB" },
  btnSecondary: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" },
  btnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  btnTextSecondary: { color: "#EF4444", fontWeight: "800", fontSize: 16 },
});
