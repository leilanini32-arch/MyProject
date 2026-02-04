
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

type RowType = {
  Boxcode: string;
  Model: string;
  Color: string;
  Qty: string;
};

export default function WarehousingScanningScreen({ navigation }: any) {
  const [barcode, setBarcode] = useState("");
  const [pallet, setPallet] = useState("");
  const [qty, setQty] = useState("");
  const [row, setRow] = useState<RowType | null>(null);

  const handleScan = () => {
    if (!barcode) return;
    
    // Simulating professional data fetch
    setRow({
      Boxcode: "C4554402",
      Model: "SKU-4402",
      Color: "Red",
      Qty: "48",
    });

    setPallet("PLT-77291");
    setQty("48");
  };

  const tableHeaders = [
    "Boxcode",
    "Model",
    "Color",
    "Qty",
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Warehouse Scanning</Text>
        </View>
       
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* SCAN INPUT CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Entry Scanner</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scan Barcode</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Scan or enter barcode"
                placeholderTextColor="#94A3B8"
                value={barcode}
                onChangeText={setBarcode}
                onSubmitEditing={handleScan}
              />
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Pallet ID</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="—"
                value={pallet}
                editable={false}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 0.6 }]}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="0"
                value={qty}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* DATA TABLE CARD */}
        <View style={styles.tableCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Scan Details</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Table Header */}
              <View style={styles.headerRow}>
                {tableHeaders.map((h) => (
                  <Text key={h} style={styles.headerCell}>
                    {h.toUpperCase()}
                  </Text>
                ))}
              </View>

              {/* Table Data */}
              <View style={styles.dataRow}>
                {row ? (
                  Object.values(row).map((v, i) => (
                    <Text key={i} style={[
                      styles.cell, 
                      i === 8 ? styles.statusCell : null
                    ]}>
                      {String(v)}
                    </Text>
                  ))
                ) : (
                  tableHeaders.map((_, i) => (
                    <Text key={i} style={styles.cell}>—</Text>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
          
          {!row && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Waiting for scan...</Text>
            </View>
          )}
        </View>

        {/* FOOTER ACTIONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('ConfirmBox')}
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#1E1B4B",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSubtitle: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginTop: -12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
    paddingLeft: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scanInnerButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
  },
  scanInnerButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  rowInputs: {
    flexDirection: "row",
  },
  disabledInput: {
    backgroundColor: "#F8FAFC",
    color: "#94A3B8",
    borderColor: "#F1F5F9",
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
    height:300,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingVertical: 10,
  },
  headerCell: {
    width: 100,
    paddingHorizontal: 12,
    color: "#64748B",
    fontWeight: "800",
    fontSize: 10,
    textAlign: "left",
  },
  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
    height: 40,
  },
  cell: {
    width: 100,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 11,
    color: "#334155",
    fontWeight: "500",
  },
  statusCell: {
    color: "#059669",
    fontWeight: "800",
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    color: "#94A3B8",
    fontSize: 13,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 6,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: "#FEE2E2",
    shadowColor: "#EF4444",
    shadowOpacity: 0.1,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#EF4444",
    fontWeight: "800",
    fontSize: 16,
  },
});
