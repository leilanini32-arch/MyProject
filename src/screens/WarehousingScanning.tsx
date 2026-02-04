import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type RowType = {
  Barcode: string;
  Pallet: string;
  Item: string;
  Name: string;
  Batch: string;
  Qty: string;
  WH: string;
  Location: string;
  Status: string;
};

export default function WarehousingScanningScreen({ navigation }: any) {
  const [barcode, setBarcode] = useState("");
  const [pallet, setPallet] = useState("");
  const [qty, setQty] = useState("");

  const [row, setRow] = useState<RowType | null>(null);

  // Fake scan (later replace by real scanner)
  const handleScan = () => {
    setRow({
      Barcode: barcode || "889234",
      Pallet: "PLT01",
      Item: "IT100",
      Name: "Milk",
      Batch: "B23",
      Qty: qty || "40",
      WH: "WH1",
      Location: "A-01",
      Status: "OK",
    });

    setPallet("PLT01");
    setQty("40");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Warehousing Scanning</Text>

      {/* INPUT CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Barcode</Text>
        <TextInput
          style={styles.input}
          placeholder="Scan barcode"
          value={barcode}
          onChangeText={setBarcode}
          onSubmitEditing={handleScan}
        />

        <Text style={styles.label}>Pallet</Text>
        <TextInput
          style={styles.input}
          placeholder="Pallet"
          value={pallet}
          editable={false}
        />

        <Text style={styles.label}>Qty</Text>
        <TextInput
          style={styles.input}
          placeholder="Qty"
          value={qty}
          editable={false}
        />
      </View>

      {/* TABLE */}
      <View style={styles.tableCard}>
        <ScrollView horizontal>
          <View>
            <View style={styles.headerRow}>
              {[
                "Barcode",
                "Pallet",
                "Item",
                "Name",
                "Batch",
                "Qty",
                "WH",
                "Location",
                "Status",
              ].map((h) => (
                <Text key={h} style={styles.headerCell}>
                  {h}
                </Text>
              ))}
            </View>

            {row ? (
              <View style={styles.dataRow}>
                {Object.values(row).map((v, i) => (
                  <Text key={i} style={styles.cell}>
                    {String(v)}
                  </Text>
                ))}
              </View>
            ) : (
              <View style={styles.dataRow}>
                {Array(9)
                  .fill("")
                  .map((_, i) => (
                    <Text key={i} style={styles.cell}>
                      —
                    </Text>
                  ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* BUTTONS */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.blue]}
         onPress={() => navigation.navigate('ConfirmBox')}>
          <Text style={styles.buttonText}>Barcode Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.red]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#E0F2FE",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E3A8A",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },

  label: {
    color: "#1E40AF",
    fontWeight: "600",
    marginBottom: 4,
  },

  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
  },

  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 10,
    elevation: 4,
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    borderRadius: 10,
  },

  headerCell: {
    width: 100,
    padding: 10,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 13,
  },

  dataRow: {
    flexDirection: "row",
  },

  cell: {
    width: 100,
    padding: 10,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    color: "#1E40AF",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
  },

  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 6,
    elevation: 3,
  },

  blue: {
    backgroundColor: "#2563EB",
  },

  red: {
    backgroundColor: "#DC2626",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
