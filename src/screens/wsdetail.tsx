import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ListRenderItem,
} from 'react-native';

/**
 * WSSN Terminal - Serial Number & IMEI Verification
 * Professional simple layout for warehouse operations.
 */

/** ✅ Type for SN / IMEI row */
interface WSSNItem {
  id: string;
  sn: string;
  imei1: string;
  imei2: string;
}

export default function WSSNTableScreen() {
  // ✅ Hooks are at the top level, never conditional
  const [palletId, setPalletId] = useState<string>('PLT-772211');
  const [items, setItems] = useState<WSSNItem[]>([
    { id: '1', sn: 'SN-9901', imei1: '358291002231', imei2: '358291002232' },
    { id: '2', sn: 'SN-9902', imei1: '358291002241', imei2: '358291002242' },
    { id: '3', sn: 'SN-9903', imei1: '358291002251', imei2: '358291002252' },
  ]);

  // Derived state for performance
  const totalQty = useMemo<number>(() => items.length, [items]);

  // Logic for pallet confirmation
  const confirmBatch = (): void => {
    if (items.length === 0) {
      Alert.alert('System Info', 'No serial numbers scanned yet.');
      return;
    }

    Alert.alert(
      'Confirm Pallet',
      `Pallet ID: ${palletId}\nTotal Units: ${totalQty}\n\nConfirm submission of all SN/IMEI data?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setItems([]);
            setPalletId('PENDING-ID');
            Alert.alert('Success', 'Pallet confirmed and submitted.');
          },
        },
      ]
    );
  };

  // Row Renderer for the SN/IMEI table
  const renderItem: ListRenderItem<WSSNItem> = ({ item, index }) => (
    <View style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.cell, styles.cellNo]}>{index + 1}</Text>
      <Text style={[styles.cell, styles.cellSN]}>{item.sn}</Text>
      <Text style={[styles.cell, styles.cellIMEI]}>{item.imei1}</Text>
      <Text style={[styles.cell, styles.cellIMEI]}>{item.imei2}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* TERMINAL HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>WSSN Terminal</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Pallet ID</Text>
            <Text style={styles.value}>{palletId}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Total Qty</Text>
            <Text style={[styles.value, { color: '#16a34a' }]}>{totalQty}</Text>
          </View>
        </View>
      </View>

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.cellNo]}>No</Text>
        <Text style={[styles.headerText, styles.cellSN]}>SN</Text>
        <Text style={[styles.headerText, styles.cellIMEI]}>IMEI 1</Text>
        <Text style={[styles.headerText, styles.cellIMEI]}>IMEI 2</Text>
      </View>

      {/* SCANNED DATA LIST */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Empty Manifest - Please Scan</Text>
        }
      />

      {/* ACTION PANEL */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          

          <TouchableOpacity
            style={[styles.btn, styles.btnExit]}
            onPress={() => Alert.alert('Exit Terminal', 'Are you sure?')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginTop: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  listContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  rowEven: { backgroundColor: '#fff' },
  rowOdd: { backgroundColor: '#f8fafc' },
  cell: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
  },
  cellNo: { flex: 0.4 },
  cellSN: { flex: 1.2, fontWeight: '800', color: '#2563eb' },
  cellIMEI: { flex: 2, fontSize: 11, color: '#64748b' },
  emptyText: {
    textAlign: 'center',
    padding: 40,
    color: '#94a3b8',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnConfirm: {
    backgroundColor: '#2563eb',
    flex: 2,
  },
  btnExit: {
    backgroundColor: '#ef4444',
    flex: 1,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
