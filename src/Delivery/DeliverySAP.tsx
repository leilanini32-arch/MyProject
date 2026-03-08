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

interface DeliveryItem {
  bonNo: string;
  model: string;
  color: string;
  qty: number;
  finishQty: number;
  difference: number;
  from: string;
  to: string;
  deliveryCode: string;
}

export default function DeliverySAP({ navigation, route }: any) {
  const global = useGlobal();
  const { gsURL, gs_factoryCode, gs_wareCode, gs_userCode, gs_userName } = global;
  const BASE_URL = gsURL;

  const [bonNo, setBonNo] = useState("");
  const [depotNo, setDepotNo] = useState("");
  const [modelInput, setModelInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Internal tracking variables (equivalent to f_ variables in C#)
  const [f_systemDeliveryCode, setFSystemDeliveryCode] = useState("");
  const [f_fromck, setFFromck] = useState("");
  const [f_tokh, setFTokh] = useState("");

  const bonRef = useRef<TextInput>(null);
  const depotRef = useRef<TextInput>(null);
  const modelRef = useRef<TextInput>(null);

  useEffect(() => {
    bonRef.current?.focus();
  }, []);

  const fetchDeliveryPlan = async (systemDeliveryCode: string) => {
    setErrorMsg("");
    setLoading(true);
    try {
      // 1. Get SAP Bill (equivalent to pub.GetSAPBill)
      const sapResponse = await fetch(`${BASE_URL}/api/SAPBill/GetSAPBill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MAIN_BILL_CODE: systemDeliveryCode,
          UserCode: gs_userCode,
          UserName: gs_userName,
        }),
      });
      const sapResult = await sapResponse.json();
      if (sapResult && sapResult.message) {
        setErrorMsg("SAP msg: " + sapResult.message);
      }
      console.log("API RESPONSE:", sapResult);
    } catch (err: any) {
      setErrorMsg("SAP Error: " + err.message);
    }

    try {
      const planResponse = await fetch(`${BASE_URL}/api/DeliveryModel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factoryCode: gs_factoryCode,
          systemDeliveryCode: systemDeliveryCode,
        }),
      });

      const planData = await planResponse.json();
      console.log("API RESPONSE2:", planData);

      const newItems: DeliveryItem[] = [];
      let fromck = "";
      let tokh = "";

      if (planData && planData.data) {
        planData.data.forEach((row: any) => {
          newItems.push({
            bonNo: systemDeliveryCode,
            model: row.model,
            color: row.color,
            qty: parseInt(row.qty),
            finishQty: parseInt(row.okqty),
            difference: parseInt(row.cyqty),
            from: row.fromWareHouse,
            to: row.toKh,
            deliveryCode: row.deliveryCode,
          });
          fromck = row.fromWareHouse;
          tokh = row.toKh;
        });
      }

      setItems(newItems);

      if (fromck !== "" && fromck !== gs_wareCode) {
        setErrorMsg("Source WareHouse Must be Login WareHouse " + gs_wareCode);
        setBonNo("");
        setItems([]);
        setFSystemDeliveryCode("");
        bonRef.current?.focus();
        return;
      }

      setFSystemDeliveryCode(systemDeliveryCode);

      if (fromck !== "") {
        setDepotNo(tokh + "#" + fromck);
        setFFromck(fromck);
        setFTokh(tokh);
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
      fetchDeliveryPlan(sn);
    }
  };

  const handleChoice = () => {
    if (selectedIndex !== null && items[selectedIndex]) {
      const deliveryCode = items[selectedIndex].deliveryCode;
      navigation.navigate('DeliveryFrm', { deliveryCode });
    } else if (items.length > 0) {
      navigation.navigate('DeliveryFrm', { deliveryCode: items[0].deliveryCode });
    } else {
      setErrorMsg("Please select an item first");
    }
  };

  const renderItem = ({ item, index }: { item: DeliveryItem; index: number }) => {
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
        <Text style={[styles.cell, { color: textColor }]}>{item.deliveryCode}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.headerTitle}>Warehouse Delivery Scanning</Text>
            <Text style={styles.headerSubtitle}>ScanNO SAP</Text>
          </View>
          {loading && <ActivityIndicator color="#FFF" />}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Entry</Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <Text style={styles.label}>BON NO.</Text>
          <TextInput
            ref={bonRef}
            style={styles.input}
            value={bonNo}
            onChangeText={setBonNo}
            onSubmitEditing={handleBonSubmit}
            placeholder="Scan or enter BON"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>DEPOT NO.</Text>
          <TextInput
            ref={depotRef}
            style={styles.input}
            value={depotNo}
            onChangeText={setDepotNo}
            placeholder="toKh#fromck"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>MODEL</Text>
          <TextInput
            ref={modelRef}
            style={styles.input}
            value={modelInput}
            onChangeText={setModelInput}
            placeholder="model#qty#price"
            autoCapitalize="characters"
          />
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.cardTitle}>Recent Scan Details</Text>
           
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              <View style={[styles.row, styles.tableHeader]}>
                {["BON NO", "Model", "Color", "QTY", "Finish", "Diff", "From", "To", "Code"].map((h) => (
                  <Text key={h} style={[styles.cell, styles.headerCell]}>{h}</Text>
                ))}
              </View>
              <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                ListEmptyComponent={<Text style={styles.empty}>Waiting for Scanning...</Text>}
                showsVerticalScrollIndicator={true}
              />
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
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#A5B4FC",
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 10,
    color: "#475569",
    textTransform: "uppercase",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
    color: "#64748B",
  },
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
  tableHeader: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cell: {
    width: 90,
    padding: 12,
    fontSize: 11,
    textAlign: "center",
    fontWeight: "600",
  },
  headerCell: {
    fontWeight: "900",
    fontSize: 10,
    color: "#64748B",
    textTransform: "uppercase",
  },
  empty: {
    textAlign: "center",
    padding: 40,
    color: "#94A3B8",
    fontStyle: "italic",
    width: 810,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  secondaryButtonText: {
    color: "#EF4444",
    fontWeight: "900",
    fontSize: 16,
  },
  errorText: { color: "#EF4444", fontSize: 12, marginBottom: 8, fontWeight: "700" },
  selectedRow: { backgroundColor: "#E0E7FF" },
});
