import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ListRenderItem,
} from 'react-native';

interface WSCItem {
  id: string;
  code: string;
  qty: number;
  model: string;
  color: string;
  snItems?: { id: string; sn: string; imei1: string; imei2: string }[];
}

export default function WSCTableScreen({ navigation }: any) {
  const [items, setItems] = useState<WSCItem[]>([
    { 
      id: '1', code: 'BX-1001', qty: 5, model: 'Alpha', color: 'Red',
      snItems: [
        { id: '1', sn: 'SN-9901', imei1: '358291002231', imei2: '358291002232' },
        { id: '2', sn: 'SN-9902', imei1: '358291002241', imei2: '358291002242' },
      ]
    },
    { 
      id: '2', code: 'BX-1002', qty: 3, model: 'Core-X', color: 'Blue',
      snItems: [
        { id: '3', sn: 'SN-9903', imei1: '358291002251', imei2: '358291002252' },
      ]
    },
    { 
      id: '3', code: 'BX-1003', qty: 2, model: 'Prime', color: 'Green',
      snItems: []
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<WSCItem | null>(null);

  const totalQty = useMemo<number>(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const confirmBatch = (): void => {
    if (items.length === 0) {
      Alert.alert('System Info', 'No active scans found to confirm.');
      return;
    }

    Alert.alert(
      'Confirm Batch Processing',
      `Review Summary:\n\nTotal Packages: ${items.length}\nTotal Units: ${totalQty}\n\nProceed with confirmation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setItems([]);
            setSelectedItem(null);
            Alert.alert('Success', 'Batch processed and inventory updated.');
          },
        },
      ]
    );
  };

  const showBarcodeDetails = (): void => {
    if (!selectedItem) {
      Alert.alert('Select Box', 'Please select a box to view details.');
      return;
    }

    navigation.navigate('WSdetail', {
      boxCode: selectedItem.code,
      snItems: selectedItem.snItems || [],
    });
  };

  const renderItem: ListRenderItem<WSCItem> = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => setSelectedItem(item)}
      style={[   
        styles.row,
        index % 2 === 0 ? styles.rowEven : styles.rowOdd,
        selectedItem?.id === item.id && { backgroundColor: '#dbeafe' },
      ]}
    >
      <Text style={[styles.cell, styles.cellNo]}>{index + 1}</Text>
      <Text style={[styles.cell, styles.cellCode]}>{item.code}</Text>
      <Text style={[styles.cell, styles.cellQty]}>{item.qty}</Text>
      <Text style={[styles.cell, styles.cellModel]}>{item.model}</Text>
      <Text style={[styles.cell, styles.cellColor]}>{item.color}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Warehousing Scanning Confirm</Text>
        <Text style={styles.subtitle}>Batch Confirmation Dashboard</Text>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Total Scanned</Text>
          <Text style={styles.summaryValue}>{items.length} Boxes</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View>
          <Text style={styles.summaryLabel}>Net Quantity</Text>
          <Text style={[styles.summaryValue, { color: '#2563eb' }]}>{totalQty} Units</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.cellNo]}>No</Text>
        <Text style={[styles.headerCell, styles.cellCode]}>Box Code</Text>
        <Text style={[styles.headerCell, styles.cellQty]}>Qty</Text>
        <Text style={[styles.headerCell, styles.cellModel]}>Model</Text>
        <Text style={[styles.headerCell, styles.cellColor]}>Color</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Waiting for scans...</Text>
          </View>
        }
      />

      <View style={styles.actionPanel}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnSecondary]}
            onPress={showBarcodeDetails}
            activeOpacity={0.7}
          >
            <Text style={styles.btnTextSecondary}>Barcode Detail</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.btnPrimary]}
            onPress={confirmBatch}
            activeOpacity={0.8}
          >
            <Text style={styles.btnTextPrimary}>Confirm</Text>
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



// Styles restent les mêmes que ton code original


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
    fontSize: 25,
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
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
  },
  cellNo: { flex: 0.6 },
  cellCode: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: 8,
    color: '#2563eb',
    fontWeight: '800',
  },
  cellQty: { flex: 1 },
  cellModel: { flex: 1.5 },
  cellColor: { flex: 1.2 },
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
  btnSecondary: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  btnTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  btnTextSecondary: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
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
