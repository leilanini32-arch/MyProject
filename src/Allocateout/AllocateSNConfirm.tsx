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

interface SNDetail {
  id: string;
  fxh: string;
  SN: string;
  model: string;
  color: string;
  imeiCode1: string;
  imeiCode2: string;
  imeiCode3: string;
  realdate: string;
  orderCode: string;
}

export default function AllocateSNConfirm({ navigation, route }: any) {
  const { fromWareHouseCode, palletCode: initialPalletCode, boxCode: initialBoxCode, SN, scanType, showConfirm, onConfirm } = route.params || {};
  const global = useGlobal();
  const { gsURL, gs_factoryCode } = global;
  const BASE_URL = gsURL;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SNDetail[]>([]);
  const [title, setTitle] = useState("");
  const [palletCode, setPalletCode] = useState(initialPalletCode || "");
  const [boxCode, setBoxCode] = useState(initialBoxCode || "");

  useEffect(() => {
    fetchSNDetails();
  }, []);

  const fetchSNDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/AllocatePalletSNConfirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factoryCode: gs_factoryCode,
          fromWareHouseCode,
          palletCode: initialPalletCode,
          boxCode: initialBoxCode,
          SN,
          scanType
        })
      });

      const result = await response.json();
       console.log("confrmsn  ",result)
      if (result.message === 'success' && result.data && result.data.length > 0) {
           const mappedData = result.data.map((row: any, index: number) => ({
                    id: index.toString(),
                    fxh: row.fxh?.toString(),
                    SN: row.sn,
                    model: row.model,
                    color: row.color,
                    imeiCode1: row.imeiCode1,
                    imeiCode2: row.imeiCode2,
                    imeiCode3: row.imeiCode3,
                    realdate: row.realDate,
                }));
        setItems(mappedData);
        const first = result.data[0];
        if (scanType === "sn") {
          setPalletCode(first.palletCode || "");
          setBoxCode(first.boxCode || "");
        }
        setTitle(`${first.model} ${first.color}`);
      } else {
        Alert.alert("Message", result.message || "There is no product in the Pallet!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load SN details");
    } finally {
      setLoading(false);
    }
  };

  const confirmBatch = (): void => {
    Alert.alert(
      'Confirm SN Processing',
      `Review Summary:\n\nTotal SNs: ${items.length}\n\nProceed with confirmation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            if (onConfirm) onConfirm();
            navigation.goBack();
            Alert.alert('Success', 'SNs confirmed and processed.');
          },
        },
      ]
    );
  };

  const renderItem: ListRenderItem<SNDetail> = ({ item, index }) => (
    <View
      style={[
        styles.row,
        index % 2 === 0 ? styles.rowEven : styles.rowOdd,
      ]}
    >
      <Text style={[styles.cell, styles.cellNo]}>{index + 1}</Text>
      <Text style={[styles.cell, styles.cellSN]}>{item.SN}</Text>
      <Text style={[styles.cell, styles.cellIMEI]}>{item.imeiCode1}</Text>
      <Text style={[styles.cell, styles.cellDate]}>{item.realdate}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>SN Scanning Confirm</Text>
        <Text style={styles.subtitle}>
          {scanType === "sn" ? `SN: ${SN}` : `Pallet: ${palletCode} | Box: ${boxCode}`}
        </Text>
        <Text style={styles.modelText}>{title}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Total Scanned</Text>
          <Text style={styles.summaryValue}>{items.length} Units</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.cellNo]}>No</Text>
        <Text style={[styles.headerCell, styles.cellSN]}>SN</Text>
        <Text style={[styles.headerCell, styles.cellIMEI]}>IMEI 1</Text>
        <Text style={[styles.headerCell, styles.cellDate]}>Date</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? <ActivityIndicator color="#2563eb" /> : <Text style={styles.emptyText}>Waiting for scans...</Text>}
          </View>
        }
      />

      <View style={styles.actionPanel}>
        {showConfirm && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnPrimary]}
            onPress={confirmBatch}
            activeOpacity={0.8}
          >
            <Text style={styles.btnTextPrimary}>Confirm</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.exitBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.exitText}>{showConfirm ? "Cancel" : "Close Terminal"}</Text>
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
  modelText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '700',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
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
  cellSN: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: 8,
    color: '#2563eb',
    fontWeight: '800',
  },
  cellIMEI: { flex: 1.5 },
  cellDate: { flex: 1 },
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
  actionBtn: {
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
