import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ListRenderItem,
} from 'react-native';

interface WSSNItem {
  id: string;
  sn: string;
  imei1: string;
  imei2: string;
}

interface WSSNTableProps {
  route: any;
  navigation: any;
}

export default function WSSNTableScreen({ route, navigation }: WSSNTableProps) {
  const { boxCode, palletCode, snItems } = route.params as {
    boxCode: string;
    palletCode: string;
    snItems: WSSNItem[];
  };

  const totalSN = snItems.length;

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
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>SN Details</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Pallet Code</Text>
            <Text style={styles.value}>{palletCode}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Box Code</Text>
            <Text style={styles.value}>{boxCode}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Total SN</Text>
            <Text style={[styles.value, { color: '#16a34a' }]}>{totalSN}</Text>
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

      {/* DATA LIST */}
      <FlatList
        data={snItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No SN data available.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
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
  summaryItem: { alignItems: 'center', flex: 1 },
  label: { fontSize: 10, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '800', color: '#1e293b' },

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
  headerText: { color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center', textTransform: 'uppercase' },

  listContainer: { backgroundColor: '#fff', marginHorizontal: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, elevation: 2 },
  row: { flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  rowEven: { backgroundColor: '#fff' },
  rowOdd: { backgroundColor: '#f8fafc' },

  cell: { fontSize: 12, color: '#334155', fontWeight: '600', textAlign: 'center' },
  cellNo: { flex: 0.4 },
  cellSN: { flex: 1.2, fontWeight: '800', color: '#2563eb' },
  cellIMEI: { flex: 2, fontSize: 11, color: '#64748b' },

  emptyText: { textAlign: 'center', padding: 40, color: '#94a3b8', fontWeight: '600' },
});
