import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";

type BoxDetail = {
  fxh: string;
  palletCode: string;
  boxCode: string;
  qty: string;
  model: string;
  color: string;
};

export default function DeliverySNBox({ navigation, route }: any) {
  const { deliveryCode } = route.params || {};
  const global = useGlobal();
  const { gsURL } = global;
  const BASE_URL = gsURL;

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<BoxDetail[]>([]);
  const [totalQty, setTotalQty] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (deliveryCode) {
      fetchBoxDetails();
    }
  }, [deliveryCode]);

  const fetchBoxDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/DeliveryPalletSNBox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FactoryCode: global.gs_factoryCode,
          WareHouseCode: global.gs_wareCode,
          DeliveryCode: deliveryCode
        })
      });

      const result = await response.json();
      if (result.message=="success" && result.data && result.data.length > 0) {
        const list: BoxDetail[] = result.data.map((item: any) => ({
          fxh: item.fxh,
          palletCode: item.palletCode,
          boxCode: item.boxCode,
          qty: item.qty,
          model: item.model,
          color: item.color
        }));

        setDetails(list);
        console.log("message5", deliveryCode); 
        
        const total = list.reduce((sum, item) => sum + parseInt(item.qty || "0"), 0);
        setTotalQty(total);
      } else {
        Alert.alert("Error", result.message || "There is no product in the Pallet!");
        setTotalQty(0);
        console.log("message55", result);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch box details");
    } finally {
      setLoading(false);
    }
  };

  const viewSNDetails = () => {
    if (selectedIndex === null) {
      Alert.alert("Selection", "Please select a box from the list first.");
      return;
    }

    const selectedItem = details[selectedIndex];
    navigation.navigate('DeliverySN', {
      deliveryCode: deliveryCode,
      palletCode: selectedItem.palletCode,
      boxCode: selectedItem.boxCode
    });
  };

  const tableHeaders = ["FXH", "Pallet", "Box", "Qty", "Model", "Color"];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Delivery Box Details</Text>
          {loading && <ActivityIndicator color="#FFF" />}
        </View>
        <Text style={styles.headerSubtitle}>Delivery: {deliveryCode || "N/A"}</Text>
        <Text style={styles.headerSubtitle}>Total qty: {totalQty}</Text>
      </View>

      <View style={styles.container}>
        {/* List Card */}
        <View style={[styles.card, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Box List</Text>
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
                {details.length > 0 ? (
                  details.map((item, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.tableDataRow, 
                        selectedIndex === index && styles.selectedRow
                      ]}
                      onPress={() => setSelectedIndex(index)}
                    >
                      <Text style={styles.cell}>{item.fxh}</Text>
                      <Text style={styles.cell}>{item.palletCode}</Text>
                      <Text style={styles.cell}>{item.boxCode}</Text>
                      <Text style={styles.cell}>{item.qty}</Text>
                      <Text style={styles.cell}>{item.model}</Text>
                      <Text style={styles.cell}>{item.color}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No data available</Text>
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
            onPress={viewSNDetails}
          >
            <Text style={styles.btnText}>SN Details</Text>
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
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  headerSubtitle: { color: "#A5B4FC", fontSize: 13, fontWeight: "600", marginTop: 4 },
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
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 8, paddingVertical: 10 },
  headerCell: { width: 100, textAlign: "center", fontSize: 10, fontWeight: "800", color: "#64748B", textTransform: "uppercase" },
  tableDataRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  selectedRow: { backgroundColor: "#E0E7FF" },
  cell: { width: 100, textAlign: "center", paddingVertical: 15, fontSize: 11, color: "#334155", fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40, width: 600 },
  emptyText: { color: "#94A3B8", fontStyle: "italic", fontSize: 13 },
  actionContainer: { flexDirection: "row", gap: 12, marginTop: 10 },
  btn: { flex: 1, height: 55, borderRadius: 14, justifyContent: "center", alignItems: "center", elevation: 3 },
  btnPrimary: { backgroundColor: "#2563EB" },
  btnSecondary: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" },
  btnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  btnTextSecondary: { color: "#EF4444", fontWeight: "800", fontSize: 16 },
});
