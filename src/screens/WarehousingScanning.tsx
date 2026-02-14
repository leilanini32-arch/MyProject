import React, { useState, useCallback, useEffect } from "react";
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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useGlobal } from "./GlobalContext";

type RowType = {
  Boxcode: string;
  Model: string;
  Color: string;
  Qty: string;
};

const BASE_URL = "http://10.164.222.93:3000";

export default function Scan({ navigation }: any) {
  const [barcode, setBarcode] = useState("");
  const [pallet, setPallet] = useState("");
  const [qty, setQty] = useState("");
  const [row, setRow] = useState<RowType | null>(null);


  const { gs_factoryCode, setgs_factoryCode } = useGlobal();
  const { gs_wareCode, setgs_wareCode } = useGlobal();
  const { gs_wareName, setgs_wareName } = useGlobal();
  const { gs_wareType, setgs_wareType } = useGlobal();
  const { gs_classCode, setgs_classCode } = useGlobal();
  const { gs_className, setgs_className } = useGlobal();
  const { gs_workdate, setgs_workdate } = useGlobal();
  const { gs_userCode, setgs_userCode } = useGlobal();
  const { gs_userName, setgs_userName } = useGlobal();
  const { gs_roleCode, setgs_roleCode } = useGlobal();

  // Réinitialisation automatique quand l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      setBarcode("");
      setPallet("");
      setQty("");
      setRow(null);
    }, [])
  );




  const handleScan = async () => {
    if (!barcode.trim()) return;

    try {
      // 1️⃣ Vérifier le code scanné
      const resCheck = await fetch(`${BASE_URL}/api/InBarcodeCheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factoryCode: gs_factoryCode,
          scanCode: barcode.trim(),
        }),
      });

      const dataCheck = await resCheck.json();

      if (!resCheck.ok || !dataCheck.dt || dataCheck.dt.length === 0) {
        Alert.alert("Error", "Data handling exceptions, please check!");
        setBarcode("");
        return;
      }

      const record = dataCheck.dt[0];
      if (record.isok !== "1") {
        Alert.alert("Error", record.retstr || "Invalid barcode!");
        console.log(record.retstr);
        setBarcode("");
        return;
      }

      // ✅ Code valide, récupérer palletCode et scanType
      const palletCode = record.palletCode;
      const scanType = record.scanType;

      // 2️⃣ Afficher ConfirmBox pour confirmation
      navigation.navigate("ConfirmBox", {
        palletCode,
        onConfirm: async (confirmed: boolean) => {
          if (!confirmed) {
            // Annulé
            setBarcode("");
            setRow(null);
            setQty("");
            return;
          }

          // 3️⃣ Si confirmé → appeler InPalletInsert
          const resInsert = await fetch(`${BASE_URL}/api/InPalletInsert`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              factoryCode: gs_factoryCode,
              wareHouseCode: gs_wareCode,
              scanType,
              palletCode,
              scanBarCode: barcode.trim(),
              classesCode: gs_classCode,
              groupCode: "GRP01",
              workdate: gs_workdate,
              createUser: gs_userCode,
            }),
          });

          const dataInsert = await resInsert.json();

          if (!resInsert.ok || !dataInsert.dt || dataInsert.dt.length === 0) {
            Alert.alert("Error", "No product in the pallet!");
            setBarcode("");
            return;
          }

          const insertRecord = dataInsert.dt[0];
          if (insertRecord.isok !== "1") {
            Alert.alert("Error", insertRecord.retstr || "Insert failed!");
            setBarcode("");
            return;
          }

          // 4️⃣ Mettre à jour l'interface

          console.log("datainsere"+insertRecord);

          setRow({
            Boxcode: insertRecord.scanBarcodeLarge,
            Model: insertRecord.model,
            Color: insertRecord.color,
            Qty: insertRecord.totalQty,
          });
          setPallet(palletCode);
          setQty(insertRecord.totalQty);
          setBarcode("");
        },
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Cannot reach server or something went wrong!");
      setBarcode("");
    }
  };


  const tableHeaders = ["Boxcode", "Model", "Color", "Qty"];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Warehouse Scanning</Text>

      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Entry Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Entry Scanner</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scan Barcode</Text>
            <TextInput

              placeholder="Scan or enter barcode"
              editable={gs_wareType === "MainWarehouse"}
              style={[
                styles.input,
                gs_wareType !== "MainWarehouse" && { backgroundColor: '#eee' }
              ]}
              placeholderTextColor="#94A3B8"
              value={barcode}
              onChangeText={setBarcode}
              onSubmitEditing={handleScan}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Pallet ID</Text>
              <TextInput
                style={[styles.input, styles.filledInput]}
                placeholder="—"
                placeholderTextColor="#94A3B8"
                value={pallet}
                editable={true}
              />
            </View>

            <View style={[styles.inputGroup, { width: 100 }]}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={[styles.input, styles.filledInput]}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                value={qty}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View style={[styles.card, { minHeight: 300 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Scan Details</Text>
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

              <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator>
                {row ? (
                  <View style={styles.tableDataRow}>
                    {Object.values(row).map((v, i) => (
                      <Text key={i} style={styles.cell}>
                        {v}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <View style={styles.tableDataRow}>
                    {tableHeaders.map((_, i) => (
                      <Text key={i} style={styles.cell}>
                        —
                      </Text>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>

          {!row && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Waiting for Scanning...</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => navigation.navigate("DetailBox")}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { padding: 16, paddingBottom: 40 },
  header: {
    backgroundColor: "#1E1B4B",
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  headerSubtitle: { color: "#A5B4FC", fontSize: 12, fontWeight: "600", marginTop: 4 },
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
    fontSize: 25,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    outlineStyle: "none" as any,
  },
  filledInput: { backgroundColor: "#FFFFFF", borderColor: "#4F46E5", fontWeight: "700" },
  rowInputs: { flexDirection: "row", alignItems: "flex-end" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 8, paddingVertical: 10 },
  headerCell: { width: 100, textAlign: "center", fontSize: 10, fontWeight: "800", color: "#64748B", textTransform: "uppercase" },
  tableDataRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  cell: { width: 100, textAlign: "center", paddingVertical: 15, fontSize: 12, color: "#334155", fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 },
  emptyText: { color: "#94A3B8", fontStyle: "italic", fontSize: 13 },
  actionContainer: { flexDirection: "row", gap: 12, marginTop: 10 },
  btn: { flex: 1, height: 55, borderRadius: 14, justifyContent: "center", alignItems: "center", elevation: 3 },
  btnPrimary: { backgroundColor: "#2563EB" },
  btnSecondary: { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" },
  btnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  btnTextSecondary: { color: "#EF4444", fontWeight: "800", fontSize: 16 },
});
