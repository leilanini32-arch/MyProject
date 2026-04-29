import React, { useState, useCallback, useEffect, useRef } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  DeviceEventEmitter,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RowType = {
  boxCode: string;
  model: string;
  color: string;
  boxQty: string;
};



export default function DeliveryFrm({ navigation, route }: any) {
  const { gsURL, setgs_gsURL ,operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,} = useGlobal();
  const BASE_URL = gsURL;
  const { deliveryCode } = route.params || { deliveryCode: "" };
  const [token, setToken] = useState("");

  const global = useGlobal();
  const [barcode, setBarcode] = useState("");
  const [toCkName, setToCkName] = useState("");
  const [totalQty, setTotalQty] = useState("");
  const [rows, setRows] = useState<RowType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);


  const inputRef = useRef<TextInput>(null);

  const ensureFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem("userToken");
      console.log("TOKEN IN delivery", t);
      if (t) setToken(t);
    };

    loadToken();
  }, []);

  // Equivalent to Frm_Delivery_Load
  useEffect(() => {
    if (token) {
      if (deliveryCode) {
        deliveryDeal(deliveryCode);
      }
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [deliveryCode, token]);

  useEffect(() => {
    if (barcode === "") {
      inputRef.current?.focus();
    }
  }, [barcode]);


  useEffect(() => {
    const subscriptionCancel = DeviceEventEmitter.addListener(
      'ON_DELIVERY_CONFIRM_CANCEL',
      () => {
        setTotalQty("");
        setRows([]);
        setBarcode("");
        inputRef.current?.focus();
      }
    );

    return () => subscriptionCancel.remove();
  }, [token]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('ON_DELIVERY_CONFIRM_OK', (data) => {
      palletDeal(data.barCode, data.scanType);
    });
    return () => subscription.remove();
  }, [token]);





  const deliveryDeal = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/DeliveryCheck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, },
        body: JSON.stringify({
          operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,
          deliveryCode: code,
          barCode: "",
          scanType: "",
          factoryCode: global.gs_factoryCode,
          wareHouseCode: global.gs_wareCode
        })
      });

      if (response.status === 401) {
        Alert.alert("Unauthorized", "Token expired or invalid.");
        return;
      }

      if (response.status === 403) {
        Alert.alert("Access Denied", "You do not have permission.");
        return;
      }


      const result = await response.json();
      if (result.message == "success" && result.data) {
        const data = result.data;
        if (data.isok === "1") {
          setToCkName(data.ckName);
        } else {
          Alert.alert("Error", data.retstr || "Validation failed");
          console.log("message1", data.retstr);
          console.log("message1", data);
        }
      } else {
        Alert.alert("Error", result.message || "Data handling exceptions, please check!");
        console.log("message2", result.message);
        console.log("message2", result.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const getType = async (sn: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/BarcodeType`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, },
        body: JSON.stringify({
          operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,
          factoryCode: global.gs_factoryCode,
          scanCode: sn
        })
      });

      if (response.status === 401) {
        Alert.alert("Unauthorized", "Token expired or invalid.");
        return;
      }

      if (response.status === 403) {
        Alert.alert("Access Denied", "You do not have permission.");
        return;
      }
      const result = await response.json();
      if (result.message === "success" && result.data && result.data.length > 0) {
        console.log("message3", result);
        return result.data[0].scanType;
      }
      return "";
    } catch (error) {
      console.error(error);
      return "";
    }
  };



  const palletDeal = async (barCode: string, scanType: string) => {
    setLoading(true);
    setRows([]);
    try {
      const response = await fetch(`${BASE_URL}/api/DeliveryInsert`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, },
        body: JSON.stringify({
          operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,
          factoryCode: global.gs_factoryCode,
          wareHouseCode: global.gs_wareCode,
          deliveryCode: deliveryCode,
          barCode: barCode,
          scanType: scanType,
          classesCode: global.gs_classCode,
          groupCode: global.gs_groupCode,
          workdate: global.gs_workdate,
          createUser: global.gs_userCode
        })
      });

      const result = await response.json();
      console.log("deliveryresult", result)
      if (result.message === "success" && result.data && result.data.length > 0) {
        const firstItem = result.data[0];
        if (firstItem.isok === "1") {
          setTotalQty(firstItem.totalQty?.toString());
          const isfinish = firstItem.isfinish;

          const newRows = result.data.map((item: any) => ({
            boxCode: item.boxCode,
            model: item.model,
            color: item.color,
            boxQty: item.boxQty
          }));
          setRows(newRows);
          console.log("message4", result);

          Alert.alert("Success", "Pallet scanned successfully!");

          if (isfinish === "1") {
            Alert.alert("Info", "The delivery of documents has already shipped completed!");
          }
        } else {
          Alert.alert("Error", firstItem.retstr || "Operation failed");
          console.log("Delivery error:", firstItem);
        }
      } else {
        Alert.alert("Error", result.message || "There is no product in the Pallet!");
        console.log("message44", result);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to process pallet");
    } finally {
      setLoading(false);
      setBarcode("");
      inputRef.current?.focus();
    }
  };



  const handleScan = async () => {
    if (!barcode.trim()) return;

    const sn = barcode.toUpperCase().trim();
    setLoading(true);
    try {
      let scanType = await getType(sn);

      if (scanType === "") {
        scanType = "pallet";
      }

      if (scanType === "pallet" || scanType === "box") {
        const response = await fetch(`${BASE_URL}/api/DeliveryCheck`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, },
          body: JSON.stringify({
            operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,
            deliveryCode: deliveryCode,
            barCode: sn,
            scanType: scanType,
            factoryCode: global.gs_factoryCode,
            wareHouseCode: global.gs_wareCode
          })
        });

        if (response.status === 401) {
          Alert.alert("Unauthorized", "Token expired or invalid.");
          return;
        }

        if (response.status === 403) {
          Alert.alert("Access Denied", "You do not have permission.");
          return;
        }
        const result = await response.json();
        if (result.message === "success" && result.data) {
          if (result.data.isok === "1") {
            setBarcode("");
            navigation.navigate('DeliverySNConfirmBox', {
              fromWareHouseCode: global.gs_wareCode,
              barCode: sn,
              scanType: scanType,
              showConfirm: true,
            });
          } else {
            Alert.alert("Error", result.data.retstr || "Validation failed");
            setBarcode("");
            inputRef.current?.focus();
          }
        } else {
          Alert.alert("Error", result.message || "Check failed");
          setBarcode("");
          inputRef.current?.focus();
        }
        return;
      }

      if (scanType === "sn") {
        const response = await fetch(`${BASE_URL}/api/DeliveryCheck`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, },
          body: JSON.stringify({
            operateUserCode, operateUserName, operateWareHouseCode, operateRandomNumber, operateSign, operateVersion,
            deliveryCode: deliveryCode,
            barCode: sn,
            scanType: "sn",
            factoryCode: global.gs_factoryCode,
            wareHouseCode: global.gs_wareCode
          })
        });

        if (response.status === 401) {
          Alert.alert("Unauthorized", "Token expired or invalid.");
          return;
        }

        if (response.status === 403) {
          Alert.alert("Access Denied", "You do not have permission.");
          return;
        }
        const result = await response.json();

        if (result.code === 500) {
          Alert.alert("Error", result.message);
          navigation.goBack();
          return;
        }
        if (result.message === "success" && result.data) {
          if (result.data.isok === "1") {
            setBarcode("");
            navigation.navigate('DeliverySNConfirm', {
              fromWareHouseCode: global.gs_wareCode,
              palletCode: "",
              boxCode: "",
              SN: sn,
              scanType,
              showConfirm: true
            });
          } else {
            Alert.alert("Error", result.data.retstr || "Validation failed");
            setBarcode("");
            inputRef.current?.focus();
          }
        } else {
          Alert.alert("Error", result.message || "Check failed");
          setBarcode("");
          inputRef.current?.focus();
        }
        return;
      }

      // Default if scanType is something else
      setBarcode("");
      inputRef.current?.focus();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Scan processing error");
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = () => {
    navigation.navigate('DeliverySNBox', { deliveryCode });
  };

  const tableHeaders = ["Boxcode", "Model", "Color", "Qty"];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Image
              source={require("../../assets/logo/left.png")}
              style={styles.returnLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Warehouse Delivery</Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.userNameText}>{global.gs_userName}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Entry Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup1}>
            <TextInput
              style={[styles.input1, styles.disabledInput1]}
              value={toCkName}
              editable={false}
              placeholder="To Warehouse"
              placeholderTextColor="#FFFFFF"
            />
          </View>

          <View style={styles.inputGroup1}>
            <TextInput
              style={[styles.input1, styles.disabledInput1]}
              value={totalQty}
              editable={false}
              placeholder="Total Qty"
              placeholderTextColor="#FFFFFF"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={barcode}
              onChangeText={setBarcode}
              onSubmitEditing={handleScan}
              placeholder=" Barcode "
              autoCapitalize="characters"
              showSoftInputOnFocus={showKeyboard}
              blurOnSubmit={false}
              onBlur={ensureFocus}
            />
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              <View style={styles.tableHeader}>
                {tableHeaders.map((h) => (
                  <Text key={h} style={[styles.headerCell, { width: 100 }]}>
                    {h}
                  </Text>
                ))}
              </View>

              <ScrollView style={{ flex: 1 }}>
                {rows.length > 0 ? (
                  rows.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.cell, { width: 100 }]}>{item.boxCode}</Text>
                      <Text style={[styles.cell, { width: 100 }]}>{item.model}</Text>
                      <Text style={[styles.cell, { width: 100 }]}>{item.color}</Text>
                      <Text style={[styles.cell, { width: 100 }]}>{item.boxQty}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { width: 400 }]}>No items scanned yet</Text>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>

        {/* Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={viewDetails}
          >
            <Text style={styles.detailButtonText}> Barcode Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 360;
const scale = (size: number) => (width / 375) * size;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#0052cc",
    paddingHorizontal: width * 0.05,
    height: scale(56),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  returnLogo: {
    width: scale(24),
    height: scale(24),
    marginRight: 10,
    tintColor: "#FFFFFF",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? scale(14) : scale(16),
    fontWeight: "900",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  userNameText: {
    color: "#FFFFFF",
    fontSize: scale(12),
    fontWeight: "700",
    marginRight: 1,
  },
  content: { flex: 1, padding: 8 },
  card: { backgroundColor: "#FFF", borderRadius: 16, padding: 8, marginBottom: 8, elevation: 2, borderWidth: 1, borderColor: "#0052cc" },
  inputGroup: { marginBottom: 4 },
  input: { backgroundColor: "#e2f0eeff", height: 32, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 0, fontSize: 12, color: "#334155", fontWeight: "600", borderWidth: 1, borderColor: "#CBD5E1" },
  disabledInput: { backgroundColor: "#E2E8F0", color: "#64748B" },
  inputGroup1: { marginBottom: 4 },
  input1: { backgroundColor: "#0052cc", height: 32, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 0, fontSize: 12, color: "#FFFFFF", fontWeight: "600", borderWidth: 1, borderColor: "#CBD5E1" },
  disabledInput1: { backgroundColor: "#0052cc", color: "#FFFFFF" },
  tableCard: { flex: 1, backgroundColor: "#FFF", borderRadius: 16, overflow: "hidden", elevation: 2, borderWidth: 1, borderColor: "#0052cc", marginBottom: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#0052cc", paddingVertical: 10 },
  headerCell: { fontSize: 10, fontWeight: "800", color: "#FFFFFF", textAlign: "center", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", alignItems: "center" },
  cell: { fontSize: 11, color: "#334155", textAlign: "center", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 40, fontStyle: "italic" },
  footer: { flexDirection: "row", gap: 12 },
  detailButton: { flex: 1, backgroundColor: "#4F46E5", padding: 12, borderRadius: 12, alignItems: "center", height: 40 },
  detailButtonText: { color: "#FFF", fontWeight: "900", fontSize: 12 },
});
