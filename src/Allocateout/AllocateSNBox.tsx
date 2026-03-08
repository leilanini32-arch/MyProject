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

interface BoxDetail {
  id: string;
  fxh: string;
  palletCode: string;
  boxCode: string;
  qty: number;
  model: string;
  color: string;
}

export default function AllocateSNBox({ navigation, route }: any) {
  const { allocateCode } = route.params || {};
  const global = useGlobal();
  const { gsURL, gs_factoryCode, gs_wareCode } = global;
  const BASE_URL = gsURL;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BoxDetail[]>([]);
  const [selectedItem, setSelectedItem] = useState<BoxDetail | null>(null);

  useEffect(() => {
    fetchBoxDetails();
  }, []);

  const fetchBoxDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/AllocatePalletSNBox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factoryCode: gs_factoryCode,
          wareHouseCode: gs_wareCode,
          allocateCode: allocateCode
        })
      });

      const result = await response.json();
      if (result.message === 'success' && result.data && result.data.length > 0) {
        const mappedData = result.data.map((row: any, index: number) => ({
          id: index.toString(),
          ...row,
          qty: parseInt(row.qty || "0", 10)
        }));
        setItems(mappedData);
      } else {
        Alert.alert("Message", result.message || "There is no product in the Pallet!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load box details");
    } finally {
      setLoading(false);
    }
  };

  const totalQty = useMemo<number>(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const showBarcodeDetails = (): void => {
    if (!selectedItem) {
      Alert.alert("Message", "Please select a box first.");
      return;
    }

    navigation.navigate('AllocateSN', {
      allocateCode,
      palletCode: selectedItem.palletCode,
      boxCode: selectedItem.boxCode
    });
  };

  const renderItem: ListRenderItem<BoxDetail> = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => setSelectedItem(item)}
      style={[
        styles.row,
        index % 2 === 0 ? styles.rowEven : styles.rowOdd,
        selectedItem?.id === item.id && { backgroundColor: '#dbeafe' },
      ]}
    >
      <Text style={[styles.cell, styles.cellNo]}>{index + 1}</Text>
      <Text style={[styles.cell, styles.cellPallet]}>{item.palletCode}</Text>
      <Text style={[styles.cell, styles.cellBox]}>{item.boxCode}</Text>
      <Text style={[styles.cell, styles.cellQty]}>{item.qty}</Text>
      <Text style={[styles.cell, styles.cellModel]}>{item.model}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Allocate SN Details</Text>
        <Text style={styles.subtitle}>Code: {allocateCode}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Total Boxes</Text>
          <Text style={styles.summaryValue}>{items.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View>
          <Text style={styles.summaryLabel}>Total Quantity</Text>
          <Text style={[styles.summaryValue, { color: '#2563eb' }]}>{totalQty} Units</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.cellNo]}>No</Text>
        <Text style={[styles.headerCell, styles.cellPallet]}>Pallet</Text>
        <Text style={[styles.headerCell, styles.cellBox]}>Box</Text>
        <Text style={[styles.headerCell, styles.cellQty]}>Qty</Text>
        <Text style={[styles.headerCell, styles.cellModel]}>Model</Text>
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
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnPrimary]}
            onPress={showBarcodeDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.btnTextPrimary}>SN Detail</Text>
          </TouchableOpacity>
        </View>

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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
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
  cellPallet: { flex: 1.5 },
  cellBox: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: 8,
    color: '#2563eb',
    fontWeight: '800',
  },
  cellQty: { flex: 0.8 },
  cellModel: { flex: 1.5 },
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  exitBtn: {
    marginTop: 15,
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
