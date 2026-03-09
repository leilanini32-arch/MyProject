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

interface AllocateItem {
  bonNo: string;
  model: string;
  color: string;
  qty: number;
  finishQty: number;
  difference: number;
  from: string;
  to: string;
  allocateCode: string;
}

export default function AllocateSAP({ navigation }: any) {
  const global = useGlobal();
  const { gsURL, gs_factoryCode, gs_wareCode, gs_userCode, gs_userName } = global;
  const BASE_URL = gsURL;

  const [bonNo, setBonNo] = useState("");
  const [depotNo, setDepotNo] = useState("");
  const [modelInput, setModelInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [items, setItems] = useState<AllocateItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Internal tracking variables
  const [f_systemAllocateCode, setFSystemAllocateCode] = useState("");
  const [f_fromck, setFFromck] = useState("");
  const [f_tock, setFTock] = useState("");

  const bonRef = useRef<TextInput>(null);
  const depotRef = useRef<TextInput>(null);
  const modelRef = useRef<TextInput>(null);

  const ensureFocus = () => {
    if (bonRef.current?.isFocused() || depotRef.current?.isFocused() || modelRef.current?.isFocused()) return;
  };

  useEffect(() => {
    bonRef.current?.focus();
  }, []);

  const fetchAllocatePlan = async (systemAllocateCode: string) => {
    setErrorMsg("");
    setLoading(true);
    try {
      // 1. Get SAP Bill
      const sapResponse = await fetch(`${BASE_URL}/api/SAPBill/GetSAPBill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MAIN_BILL_CODE: systemAllocateCode,
          UserCode: gs_userCode,
          UserName: gs_userName,
        }),
      });
      const sapResult = await sapResponse.json();
      if (sapResult && sapResult.message) {
        setErrorMsg("SAP msg: " + sapResult.message);
      }
    } catch (err: any) {
      setErrorMsg("SAP Error: " + err.message);
    }

    try {
      const planResponse = await fetch(`${BASE_URL}/api/AllocateModel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FactoryCode: gs_factoryCode,
          SystemAllocateCode: systemAllocateCode,
        }),
      });

      const planData = await planResponse.json();
      const newItems: AllocateItem[] = [];
      let fromck = "";
      let tock = "";

      if (planData && Array.isArray(planData.data)) {
        planData.data.forEach((row: any) => {
          newItems.push({
            bonNo: systemAllocateCode,
            model: row.model,
            color: row.color,
            qty: parseInt(row.qty),
            finishQty: parseInt(row.okqty),
            difference: parseInt(row.cyqty),
            from: row.fromWareHouse,
            to: row.toWareHouse,
            allocateCode: row.allocateCode,
          });
          fromck = row.fromWareHouse;
          tock = row.toWareHouse;
        });
      }

      setItems(newItems);
      console.log("FROM CK:", fromck);
      console.log("LOGIN CK:", gs_wareCode);
      if (fromck !== "" && fromck !== gs_wareCode) {
        setErrorMsg("Source WareHouse Must be Login WareHouse " + gs_wareCode);
        setBonNo("");
        setItems([]);
        setFSystemAllocateCode("");
        bonRef.current?.focus();
        return;
      }

      setFSystemAllocateCode(systemAllocateCode);

      if (fromck !== "") {
        setDepotNo(fromck + "#" + tock);
        setFFromck(fromck);
        setFTock(tock);
        modelRef.current?.focus();
      } else {
        setDepotNo("");
        setModelInput("");
        depotRef.current?.focus();
      }
    } catch (err: any) {
      setErrorMsg("Plan Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBonSubmit = () => {
    const sn = bonNo.toUpperCase().trim();
    if (sn.length > 0) {
      fetchAllocatePlan(sn);
    }
  };

  const handleChoice = () => {
    if (selectedIndex !== null && items[selectedIndex]) {
      const allocateCode = items[selectedIndex].allocateCode;
      navigation.navigate('AllocateFrm', { allocateCode });
      console.log(allocateCode)
    } else if (items.length > 0) {
      navigation.navigate('AllocateFrm', { allocateCode: items[0].allocateCode });
    } else {
      setErrorMsg("Please select an item first");
    }
  };



  const renderItem = ({ item, index }: { item: AllocateItem; index: number }) => {
    let textColor = "#000";
    if (item.difference > 0) {
      textColor = item.finishQty > 0 ? "blue" : "red";
    }
    const isSelected = selectedIndex === index;

    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.selectedRow]}
        onPress={() => setSelectedIndex(index)}
      >
        <Text style={[styles.cell, { color: textColor }]}>{item.bonNo}</Text>
        <Text style={[styles.cell, { color: textColor }]}>{item.model}</Text>
        <Text style={[styles.cell, { color: textColor }]}>{item.color}</Text>
        <Text style={[styles.cell, { color: textColor }]}>{item.qty}</Text>
        <Text style={[styles.cell, { color: textColor }]}>{item.finishQty}</Text>
        <Text style={[styles.cell, { color: textColor }]}>{item.difference}</Text>
        <Text style={[styles.cell, { color: textColor }]}>{item.from}</Text>
        <Text style={[styles.cell, { color: textColor }]}>{item.to}</Text>
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
            <Text style={styles.headerTitle}>Warehouse Allocate Scanning</Text>
            <Text style={styles.headerSubtitle}>ScanNO SAP</Text>
          </View>
          {loading && <ActivityIndicator color="#FFF" />}
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.cardTitle}>Allocate Entry</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowKeyboard(!showKeyboard);
                bonRef.current?.focus();
              }}
              style={styles.keyboardToggle}
            >
              <Text style={styles.keyboardToggleText}>
                {showKeyboard ? "⌨️ Hide Keyboard" : "⌨️ Show Keyboard"}
              </Text>
            </TouchableOpacity>
          </View>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.compactInputRow}>
            <Text style={styles.compactLabel}>BON NO.</Text>
            <TextInput
              ref={bonRef}
              style={styles.compactInput}
              value={bonNo}
              onChangeText={setBonNo}
              onSubmitEditing={handleBonSubmit}
              placeholder="Scan BON"
              autoCapitalize="characters"
              showSoftInputOnFocus={showKeyboard}
              blurOnSubmit={false}
              onBlur={ensureFocus}
            />
          </View>

          <View style={styles.compactInputRow}>
            <Text style={styles.compactLabel}>DEPOT</Text>
            <TextInput
              ref={depotRef}
              style={styles.compactInput}
              value={depotNo}
              onChangeText={setDepotNo}
              placeholder="from#to"
              autoCapitalize="characters"
              showSoftInputOnFocus={showKeyboard}
              blurOnSubmit={false}
              onBlur={ensureFocus}
            />
          </View>

          <View style={styles.compactInputRow}>
            <Text style={styles.compactLabel}>MODEL</Text>
            <TextInput
              ref={modelRef}
              style={styles.compactInput}
              value={modelInput}
              onChangeText={setModelInput}
              placeholder="model#qty#price"
              autoCapitalize="characters"
              showSoftInputOnFocus={showKeyboard}
              blurOnSubmit={false}
              onBlur={ensureFocus}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Allocate Details</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              <View style={[styles.row, styles.tableHeader]}>
                {["BON NO", "Model", "Color", "QTY", "Finish", "Diff", "From", "To", "Code"].map((h) => (
                  <Text key={h} style={[styles.cell, styles.headerCell]}>{h}</Text>
                ))}
              </View>
              <View>
                {items.length === 0 ? (
                  <Text style={styles.empty}>Waiting for Scanning...</Text>
                ) : (
                  items.map((item, index) => renderItem({ item, index }))
                )}
              </View>
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
      </ScrollView>
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
  compactInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  compactLabel: { width: 60, fontSize: 11, fontWeight: "700", color: "#64748B" },
  compactInput: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 8,
    fontSize: 13,
    color: "#000",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  label: { fontSize: 11, fontWeight: "700", marginTop: 8, color: "#64748B" },
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
  empty: { textAlign: "center", padding: 40, color: "#94A3B8", fontStyle: "italic", width: 810 },
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
