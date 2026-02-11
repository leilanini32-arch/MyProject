import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
  BackHandler,
  Alert,
  TextInput,
} from "react-native";

/* =====================
   Types
===================== */
type WarehouseItem = {
  wareHouseCode: string;
  wareHouseName: string;
};

type CustomInputRef = {
  focus: () => void;
};

/* =====================
   Custom Input
===================== */
const CustomInput = forwardRef<CustomInputRef, any>(
  (
    {
      label,
      value,
      placeholder,
      isSelect = false,
      isPassword = false,
      onChangeText,
      options = [],
      inputRef,
      onSubmitEditing,
    },
    ref
  ) => {
    const [showModal, setShowModal] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const hiddenInputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => hiddenInputRef.current?.focus(),
    }));

    const handleSelect = (item: any) => {
      onChangeText(item);
      setShowModal(false);
    };

    return (
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>{label}</Text>

        {isSelect ? (
          <TouchableOpacity
            style={[styles.inputContainer, isFocused && styles.inputFocused]}
            onPress={() => setShowModal(true)}
          >
            <Text style={value ? styles.input : styles.placeholderText}>
              {value || placeholder}
            </Text>
            <Text style={styles.chevronIcon}>▼</Text>
          </TouchableOpacity>
        ) : (
          <View
            style={[styles.inputContainer, isFocused && styles.inputFocused]}
          >
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#94a3b8"
              style={styles.input}
              secureTextEntry={isPassword && !showPassword}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={onSubmitEditing}
              blurOnSubmit={false}
              returnKeyType="next"
            />

            {isPassword && (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={{ fontSize: 18 }}>
                  {showPassword ? "🙈" : "👁️"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isSelect && (
          <Modal transparent visible={showModal} animationType="fade">
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowModal(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select {label}</Text>
                <FlatList
                  data={options}
                  keyExtractor={(item: any) =>
                    item.wareHouseCode ?? item
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.optionText}>
                        {item.wareHouseName ?? item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {isSelect && (
          <TextInput
            style={{ height: 0, width: 0, padding: 0, margin: 0 }}
            ref={hiddenInputRef}
          />
        )}
      </View>
    );
  }
);

/* =====================
   Login Screen
===================== */
export default function Login({ navigation }: any) {
  const [selectedClass, setSelectedClass] = useState("");
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [serverPassword, setServerPassword] = useState("");

  const [warehouseOptions, setWarehouseOptions] = useState<WarehouseItem[]>(
    []
  );
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseItem | null>(null);

  const userRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const warehouseRef = useRef<CustomInputRef>(null);

  /* =====================
     Load Classes
  ===================== */
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await fetch(
          "http://10.164.222.93:3000/api/getClassList",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ factoryCode: "001" }),
          }
        );
        const data = await res.json();
        setClassOptions(data.dt.map((c: any) => c.classesName));
      } catch {
        Alert.alert("Error", "Unable to load classes");
      }
    };

    loadClasses();
    userRef.current?.focus();
  }, []);

  /* =====================
     Check User
  ===================== */
  const checkUserCode = async () => {
    if (!userCode) {
      Alert.alert("Error", "UserCode required");
      return;
    }

    try {
      const res = await fetch("http://10.164.222.93:3000/api/getUserInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factoryCode: "001", userCode }),
      });

      const data = await res.json();

      if (!data.dt || data.dt.length === 0) {
        Alert.alert(
          "Error",
          "The user does not have permissions to operate!"
        );
        return;
      }

      setServerPassword(data.dt[0].passwordInput);
      Alert.alert(serverPassword);

      passwordRef.current?.focus();
    } catch {
      Alert.alert("Error", "Server not reachable");
    }
  };

  /* =====================
     Check Password
  ===================== */
  const checkPassword = async () => {
    if (password !== serverPassword) {
      Alert.alert("Error", "Password Error, please check!");
      return;
    }

    try {
      const res = await fetch(
        "http://10.164.222.93:3000/api/getAllWareHouses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ factoryCode: "001", userCode }),
        }
      );

      const data = await res.json();

      setWarehouseOptions(
        data.dt.map((w: any) => ({
          wareHouseCode: w.wareHouseCode,
          wareHouseName: w.wareHouseName,
        }))
      );

      setTimeout(() => warehouseRef.current?.focus(), 100);
    } catch {
      Alert.alert("Error", "Unable to load warehouses");
    }
  };

  /* =====================
     Final Login
  ===================== */
  const handleLogin = async () => {
    if (!selectedWarehouse) {
      Alert.alert("Error", "Select warehouse");
      return;
    }

    const wareHouseCode = selectedWarehouse.wareHouseCode;
    const wareHouseName = selectedWarehouse.wareHouseName;

    console.log("WAREHOUSE:", wareHouseCode, wareHouseName);

    try {
      /* =========================
         1️⃣ GET WAREHOUSE INFO
      ========================= */
      const resWare = await fetch(
        "http://10.164.222.93:3000/api/getWareInfo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            factoryCode: "001",
            wareHouseCode,
          }),
        }
      );

      const dataWare = await resWare.json();

      if (!resWare.ok || !dataWare.dt || dataWare.dt.length === 0) {
        Alert.alert("Error", "Warehouse does not exist!");
        return;
      }

      const wareHouseType = dataWare.dt[0].wareHouseType;
      console.log("WAREHOUSE TYPE:", wareHouseType);

      /* =========================
         2️⃣ CHECK LICENSE
      ========================= */
      const resCheck = await fetch(
        "http://10.164.222.93:3000/api/checkWarehouse",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            factoryCode: "001",
            wareHouseCode,   // ✅ on envoie le résultat ici
          }),
        }
      );

      const dataCheck = await resCheck.json();

      if (!resCheck.ok) {
        Alert.alert("License Error", dataCheck.message);
        return;
      }else{   Alert.alert("Ok",dataCheck.message);}

    
       

      /* =========================
         3️⃣ CHECK USER
      ========================= */
      const resUser = await fetch(
        "http://10.164.222.93:3000/api/getUserInfo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            factoryCode: "001",
            userCode,
          }),
        }
      );

      const dataUser = await resUser.json();

      if (!resUser.ok || !dataUser.dt || dataUser.dt.length === 0) {
        Alert.alert("Error", "The user does not have permissions to operate!");
        return;
      }

      if (dataUser.dt[0].passwordInput !== password) {
        Alert.alert("Error", "Password Error, please check!");
        passwordRef.current?.focus();
        return;
      }

      /* =========================
         ✅ SUCCESS LOGIN
      ========================= */
      navigation.navigate("Menu");

    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Cannot reach server or something went wrong!");
    }
  };


  const handleExit = () => {
    Alert.alert("Exit", "Close application?", [
      { text: "Cancel", style: "cancel" },
      { text: "Exit", onPress: () => BackHandler.exitApp() },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>IWM</Text>
            </View>
            <Text style={styles.title}>
              Intelligent Warehouse Management
            </Text>
            <Text style={styles.subtitle}>Log in to manage inventory</Text>
          </View>

          {/* ✅ Info Box ajouté */}
          <View style={styles.infoBox}>
            <Text style={styles.url}>mespdamobile.condor.dz</Text>
            <Text style={styles.version}>Build V25.08.18</Text>
          </View>

          <View style={styles.form}>
            <CustomInput
              label="Classes"
              placeholder="Select Class"
              value={selectedClass}
              onChangeText={setSelectedClass}
              isSelect
              options={classOptions}
            />

            <CustomInput
              label="User Code"
              placeholder="Enter your ID"
              value={userCode}
              onChangeText={setUserCode}
              inputRef={userRef}
              onSubmitEditing={checkUserCode}
            />

            <CustomInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              inputRef={passwordRef}
              onSubmitEditing={checkPassword}
            />

            <CustomInput
              ref={warehouseRef}
              label="Warehouse"
              placeholder="Select Warehouse"
              value={selectedWarehouse?.wareHouseName}
              onChangeText={setSelectedWarehouse}
              isSelect
              options={warehouseOptions}
              onSubmitEditing={handleLogin}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleLogin}
            >
              <Text style={styles.primaryButtonText}>LogIn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleExit}
            >
              <Text style={styles.secondaryButtonText}>Close App</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =====================
   Styles (ajouté styles infoBox)
===================== */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#ffffff" },
  container: { padding: 24, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 16 },
  logoBox: {
    width: 60,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0052cc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  subtitle: { fontSize: 13, color: "#64748b" },
  form: { marginBottom: 12 },
  inputWrapper: { marginBottom: 10 },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  inputContainer: {
    height: 65,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  inputFocused: { borderColor: "#0052cc" },
  input: { flex: 1, fontSize: 20, color: "#0f172a" },
  placeholderText: { color: "#94a3b8" },
  chevronIcon: { fontSize: 10, color: "#94a3b8" },
  buttonContainer: { gap: 10, marginTop: 10 },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: { backgroundColor: "#0052cc" },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryButton: { borderWidth: 2, borderColor: "#e2e8f0" },
  secondaryButtonText: { fontWeight: "700", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  optionItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  optionText: { fontSize: 16, textAlign: "center" },

  /* ======= Info Box Styles ======= */
  infoBox: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  url: { fontSize: 11, color: "#94a3b8", fontWeight: "700" },
  version: { fontSize: 12, fontWeight: "700", marginTop: 2, color: "#1e293b" },
});
