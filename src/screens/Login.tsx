import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';

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
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useGlobal } from "../../GlobalContext.tsx";


/* =====================
   Types
===================== */
type WarehouseItem = {
  wareHouseCode: string;
  wareHouseName: string;
};

type ClassItem = {
  ClassCode: string;
  ClassName: string;
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
      showSoftInput = true,
      onBlur,
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
              onBlur={(e) => {
                setIsFocused(false);
                if (onBlur) onBlur();
              }}
              onSubmitEditing={onSubmitEditing}
              blurOnSubmit={false}
              returnKeyType="next"
              showSoftInputOnFocus={showSoftInput}
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
                    item.ClassCode ?? item.wareHouseCode ?? item
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.optionText}>
                        {item.ClassName ?? item.wareHouseName ?? item}
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
  const { gsURL, setgs_gsURL } = useGlobal();
  const BASE_URL = gsURL;


  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [serverPassword, setServerPassword] = useState("");

  const [classOptions, setClassOptions] = useState<ClassItem[]>(
    []
  );

  const [selectedClass, setSelectedClass] =
    useState<ClassItem | null>(null);

  const [warehouseOptions, setWarehouseOptions] = useState<WarehouseItem[]>(
    []
  );
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseItem | null>(null);
  const [loading, setLoading] = useState(false);

  const userRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const warehouseRef = useRef<CustomInputRef>(null);
  const classRef = useRef<CustomInputRef>(null);

  // PDA Optimization: Focus management
  const [activeField, setActiveField] = useState<"user" | "password" | "warehouse" | "class">("class");

  const ensureFocus = () => {
    setTimeout(() => {
      if (activeField === "user") userRef.current?.focus();
      else if (activeField === "password") passwordRef.current?.focus();
      else if (activeField === "warehouse") warehouseRef.current?.focus();
      else if (activeField === "class") classRef.current?.focus();
    }, 100);
  };

  const { gs_factoryCode } = useGlobal();
  const { setgs_wareCode } = useGlobal();
  const { setgs_wareName } = useGlobal();
  const { setgs_wareType } = useGlobal();
  const { setgs_classCode } = useGlobal();
  const { setgs_className } = useGlobal();
  const { gs_workdate, setgs_workdate } = useGlobal();
  const { setgs_userCode } = useGlobal();
  const { setgs_userName } = useGlobal();
  const { setgs_roleCode } = useGlobal();




  const handleSelectWarehouse = (item: any) => {
    setSelectedWarehouse(item);


    setTimeout(() => {
      warehouseRef.current?.focus();
    }, 100);


  };



  /* =====================
     Load Classes
  ===================== */

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/GetClassList/GetClassList`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ factoryCode: gs_factoryCode }),
        });

        const data = await res.json();
        console.log("API RESPONSE:", data);

        setClassOptions(
          data.data.map((c: any) => ({
            ClassCode: c.classesCode,
            ClassName: c.classesName,
          }))
        );
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Unable to load classes");
      }
    };

    loadClasses();
    setTimeout(() => {
      classRef.current?.focus();
      setActiveField("class");
    }, 500);
  }, []);


  /* =====================
     Check User
  ===================== */
  const checkUserCode = async () => {
    if (!userCode) {
      Alert.alert("Error", "UserCode required");
      return;
    }

    // QR Scan Detection (Format: username|password)
    if (userCode.includes("|")) {
      const [u, p] = userCode.split("|");
      setUserCode(u);
      setPassword(p);
      processQRScan(u, p);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/UserInfo/getuserinfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factoryCode: gs_factoryCode,
          userCode: userCode
        }),
      });

      const data = await res.json();
      console.log(data);
      if (data.code !== 200) {
        Alert.alert("Error", data.message);
        return;
      }

      if (!data.data || data.data.length === 0) {
        Alert.alert("Error", "User not found");
        return;
      }

      const passwordFromServer = data.data.passwordInput;
      console.log(passwordFromServer);

      setServerPassword(passwordFromServer);
      setActiveField("password");
      setTimeout(() => passwordRef.current?.focus(), 100);

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Server not reachable");
    }
  };

  /* =====================
     Process QR Scan
  ===================== */
  const processQRScan = async (u: string, p: string) => {
    setLoading(true);
    try {
      // 1. Get User Info
      const userRes = await fetch(`${BASE_URL}/api/UserInfo/getuserinfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factoryCode: gs_factoryCode,
          userCode: u
        }),
      });
      const userData = await userRes.json();

      if (userData.code !== 200 || !userData.data || userData.data.length === 0) {
        Alert.alert("Error", "User not found in QR");
        setLoading(false);
        return;
      }

      const srvPwd = userData.data.passwordInput;
      setServerPassword(srvPwd);

      // 2. Validate Password
      if (p !== srvPwd) {
        Alert.alert("Error", "QR Password Mismatch");
        setLoading(false);
        return;
      }

      // 3. Load Warehouses
      const wareRes = await fetch(
        `${BASE_URL}/api/WareListByFactory/GetWareListByFactory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            factoryCode: gs_factoryCode,
            userCode: u
          }),
        }
      );
      const wareData = await wareRes.json();
      
      setWarehouseOptions(
        wareData.data.map((w: any) => ({
          wareHouseCode: w.wareHouseCode,
          wareHouseName: w.wareHouseName.trim(),
        }))
      );

      setActiveField("warehouse");
      setTimeout(() => warehouseRef.current?.focus(), 100);
      Alert.alert("Success", "QR Login: Please select warehouse");

    } catch (error) {
      Alert.alert("Error", "QR processing failed");
    } finally {
      setLoading(false);
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
        `${BASE_URL}/api/WareListByFactory/GetWareListByFactory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            factoryCode: gs_factoryCode,
            userCode: userCode
          }),
        }
      );

      const data = await res.json();
      console.log("donnes de wh", data);
      setWarehouseOptions(
        data.data.map((w: any) => ({
          wareHouseCode: w.wareHouseCode,
          wareHouseName: w.wareHouseName.trim(),
        }))
      );
      
      setActiveField("warehouse");
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

    setgs_wareCode(wareHouseCode);
    setgs_wareName(wareHouseName);

    console.log("WAREHOUSE:", wareHouseCode, wareHouseName);




    try {
      /* =========================
         1️⃣ GET WAREHOUSE INFO
      ========================= */
      const resWare = await fetch(
        `${BASE_URL}/api/BaseWarehouse/GetWareInfo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            factoryCode: gs_factoryCode,
            wareHouseCode: wareHouseCode,
          }),
        }
      );

      const dataWare = await resWare.json();

      // ✅ Correction : dataWare.data est un objet, pas un tableau
      if (!resWare.ok || !dataWare.data) {
        Alert.alert("Error", "Warehouse does not exist!");
        return;
      }

      console.log("Données warehouse:", dataWare);

      const wareHouseType = dataWare.data.wareHouseType;
      setgs_wareType(wareHouseType);
      console.log("WAREHOUSE TYPE:", wareHouseType);

      /* =========================
      2️⃣ CHECK LICENSE
   ========================= */
      const resCheck = await fetch(
        `${BASE_URL}/api/CheckLicense/CheckLicense`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            factoryCode: gs_factoryCode,
            wareHouseCode: wareHouseCode,
          }),
        }
      );

      const dataCheck = await resCheck.json();

      // Vérification
      if (!dataCheck.data) {
        Alert.alert("License Error", dataCheck.message || "Unknown error");
        return;
      }
      Alert.alert("Ok", "License valid");





      /* =========================
     3️⃣ CHECK USER
  ========================= */
      const resUser = await fetch(
        `${BASE_URL}/api/UserInfo/getuserinfo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            factoryCode: gs_factoryCode, // ✅ nom correct attendu par l'API
            userCode: userCode,
          }),
        }
      );

      const dataUser = await resUser.json();

      // Vérification si la requête a échoué ou si aucun utilisateur trouvé
      if (!resUser.ok || !dataUser.data) {
        Alert.alert(
          "Error",
          "The user does not have permissions to operate!"
        );
        return;
      }

      // Comparaison du mot de passe
      if (dataUser.data.passwordInput !== password) {
        Alert.alert("Error", "Password Error, please check!");
        passwordRef.current?.focus();
        return;
      }

      // Mise à jour des states
      setgs_userCode(userCode);
      setgs_userName(dataUser.data.userCode);
      setgs_roleCode(dataUser.data.frolecode);

      console.log("User info are:", dataUser.data);

      /* =========================
        4️⃣ GET WORKDATE
     ========================= */

      try {
        if (!selectedClass) {
          Alert.alert("Error", "Select Class");
          return;
        }

        const ClassCode = selectedClass.ClassCode;
        const ClassName = selectedClass.ClassName;

        setgs_classCode(ClassCode);
        setgs_className(ClassName);

        const resWorkdate = await fetch(`${BASE_URL}/api/Workdate/getworkdate`, {
          method: "POST", // POST obligatoire
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            factoryCode: gs_factoryCode,
            classesCode: ClassCode,
          }),
        });

        const dataWorkdate = await resWorkdate.json();
        console.log("Workdate API response:", dataWorkdate);

        if (!resWorkdate.ok || !dataWorkdate.data) {
          Alert.alert("Error", dataWorkdate.message || "Unable to get workdate!");
          return;
        }


        setgs_workdate(dataWorkdate.data.workdate);
        console.log("Workdate set:", gs_workdate);

      } catch (error) {
        console.error("Fetch workdate error:", error);
        Alert.alert("Error", "Something went wrong while fetching workdate!");
      }


      /* =========================
         ✅ SUCCESS LOGIN
      ========================= */

      /* =========================
   ✅ GENERATE JWT AFTER ALL CHECKS
========================= */
      /*try {
        const tokenRes = await fetch(`${BASE_URL}/api/Generatejwt/generate-jwt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userCode: userCode,
            factoryCode: gs_factoryCode,
            roleCode: gs_roleCode
          }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
          Alert.alert("Error", "Cannot generate JWT");
          return;
        }

        // Stocker le JWT localement
        await AsyncStorage.setItem("userToken", tokenData.token);
        console.log("JWT generated:", tokenData.token);

        // Navigation après tout OK
        navigation.navigate("Menu");

      } catch (error) {
        console.error("JWT generation error:", error);
        Alert.alert("Error", "Something went wrong while generating JWT!");
      }*/

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
            <Text style={styles.qrHint}>QR Format: username|password</Text>
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0052cc" />
              <Text style={styles.loadingText}>Processing QR Scan...</Text>
            </View>
          )}

          <View style={styles.form}>
            <CustomInput
              ref={classRef}
              label="Classes"
              placeholder="Select Class"
              value={selectedClass?.ClassName}
              onChangeText={(val: any) => {
                setSelectedClass(val);
                setActiveField("user");
                setTimeout(() => userRef.current?.focus(), 100);
              }}
              isSelect
              options={classOptions}
              onBlur={ensureFocus}
            />

            <CustomInput
              label="User Code"
              placeholder="Enter your ID"
              value={userCode}
              onChangeText={setUserCode}
              inputRef={userRef}
              onSubmitEditing={checkUserCode}
              onFocus={() => setActiveField("user")}
              onBlur={ensureFocus}
            />

            <CustomInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              inputRef={passwordRef}
              onSubmitEditing={checkPassword}
              onFocus={() => setActiveField("password")}
              onBlur={ensureFocus}
            />

            <CustomInput
              ref={warehouseRef}
              label="Warehouse"
              placeholder="Select Warehouse"
              value={selectedWarehouse?.wareHouseName}
              onChangeText={(val: any) => {
                setSelectedWarehouse(val);
                // After warehouse, user usually clicks Login button
              }}
              isSelect
              options={warehouseOptions}
              onSubmitEditing={handleSelectWarehouse}
              onBlur={ensureFocus}
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
   Styles 
===================== */
const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 360;
const scale = (size: number) => (width / 375) * size;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  container: {
    padding: width * 0.06,
    paddingBottom: height * 0.05,
  },

  header: {
    alignItems: "center",
    marginBottom: height * 0.02,
  },

  logoBox: {
    width: isSmallDevice ? 50 : 60,
    height: isSmallDevice ? 40 : 48,
    borderRadius: 12,
    backgroundColor: "#0052cc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  logoText: {
    color: "#fff",
    fontSize: isSmallDevice ? scale(14) : scale(18),
    fontWeight: "900",
  },

  title: {
    fontSize: isSmallDevice ? scale(14) : scale(17),
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },

  subtitle: {
    fontSize: isSmallDevice ? scale(10) : scale(12),
    color: "#64748b",
  },

  form: {
    marginBottom: height * 0.015,
  },

  inputWrapper: {
    marginBottom: height * 0.012,
  },

  label: {
    fontSize: isSmallDevice ? scale(9) : scale(11),
    fontWeight: "700",
    marginBottom: 4,
  },

  inputContainer: {
    height: isSmallDevice ? 55 : 65,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.03,
  },

  inputFocused: {
    borderColor: "#0052cc",
  },

  input: {
    flex: 1,
    fontSize: isSmallDevice ? scale(14) : scale(18),
    color: "#0f172a",
  },

  placeholderText: {
    color: "#94a3b8",
    fontSize: isSmallDevice ? scale(13) : scale(16),
  },

  chevronIcon: {
    fontSize: isSmallDevice ? scale(10) : scale(12),
    color: "#94a3b8",
  },

  buttonContainer: {
    gap: 10,
    marginTop: height * 0.02,
  },

  button: {
    height: isSmallDevice ? 44 : 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    backgroundColor: "#0052cc",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: isSmallDevice ? scale(13) : scale(15),
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },

  secondaryButtonText: {
    fontWeight: "700",
    fontSize: isSmallDevice ? scale(13) : scale(15),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    width: width * 0.9,
    maxHeight: height * 0.6,
    borderRadius: 16,
    padding: width * 0.05,
  },

  modalTitle: {
    fontSize: isSmallDevice ? scale(14) : scale(17),
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },

  optionItem: {
    paddingVertical: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  optionText: {
    fontSize: isSmallDevice ? scale(13) : scale(15),
    textAlign: "center",
  },

  /* ===== Info Box ===== */

  infoBox: {
    backgroundColor: "#f8fafc",
    padding: width * 0.03,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: height * 0.02,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  url: {
    fontSize: isSmallDevice ? scale(9) : scale(11),
    color: "#94a3b8",
    fontWeight: "700",
  },

  version: {
    fontSize: isSmallDevice ? scale(10) : scale(12),
    fontWeight: "700",
    marginTop: 2,
    color: "#1e293b",
  },

  qrHint: {
    fontSize: scale(9),
    color: "#64748b",
    marginTop: 4,
    fontStyle: "italic",
  },

  loadingOverlay: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    marginBottom: 15,
  },

  loadingText: {
    marginTop: 8,
    fontSize: scale(12),
    color: "#0052cc",
    fontWeight: "600",
  },
});
