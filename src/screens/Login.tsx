import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
} from "react-native";

/* =====================
   Custom Input avec Focus
===================== */
const CustomInput = ({
  label,
  value,
  placeholder,
  isSelect = false,
  onChangeText,
  options = [],
}: any) => {
  const [showModal, setShowModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // focus

  const handleSelect = (item: string) => {
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
          activeOpacity={0.7}
        >
          <Text style={value ? styles.input : styles.placeholderText}>
            {value || placeholder}
          </Text>
          <Text style={styles.chevronIcon}>▼</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            style={styles.input}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
      )}

      {isSelect && (
        <Modal transparent visible={showModal} animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

/* =====================
   Login Screen
===================== */
export default function Login({ navigation }: any) {
  const [selectedClass, setSelectedClass] = useState("");
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const classOptions = ["Day", "Night", "Afternoon", "Evening"];
  const warehouseOptions = [
    "Main Logistics Center",
    "North Wing Hub",
    "South Terminal",
    "East Storage Unit",
    "Cold Storage Alpha",
  ];

  const handleLogin = () => {
    if (!userCode || !password) {
      Alert.alert("Error", "Please enter your credentials");
      return;
    }

    if (userCode === "admin" && password === "admin") {
      Alert.alert(
        "Success",
        `Login successful!\nClass: ${selectedClass}\nWarehouse: ${selectedWarehouse}`
      );
      navigation.navigate("Menu");
    } else {
      Alert.alert("Error", "Incorrect Password or Usercode");
    }
  };

  const handleExit = () => {
    Alert.alert("Exit", "Are you sure you want to close the application?", [
      { text: "Cancel", style: "cancel" },
      { text: "Exit", style: "destructive" },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>IWM</Text>
            </View>
            <Text style={styles.title}>Intelligent Warehouse Management</Text>
            <Text style={styles.subtitle}>Log in to manage inventory</Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.url}>mespdamobile.condor.dz</Text>
            <Text style={styles.version}>Build V25.08.18</Text>
          </View>

          {/* Form */}
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
            />

            <CustomInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
            />

            <CustomInput
              label="Warehouse"
              placeholder="Select Warehouse"
              value={selectedWarehouse}
              onChangeText={setSelectedWarehouse}
              isSelect
              options={warehouseOptions}
            />
          </View>

          {/* Buttons */}
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
   Styles (Version 1 avec Focus)
===================== */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoBox: {
    width: 60,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0052cc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  url: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "700",
  },
  version: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
    color: "#1e293b",
  },
  form: {
    marginBottom: 12,
  },
  inputWrapper: {
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
    color: "#334155",
  },
  inputContainer: {
    height: 65,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  inputFocused: {
    borderColor: "#0052cc",
    backgroundColor: "#f8fbff",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    paddingVertical: 0,
  },
  placeholderText: {
    color: "#94a3b8",
  },
  chevronIcon: {
    fontSize: 10,
    color: "#94a3b8",
    marginLeft: 6,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 10,
  },
  button: {
    height: 48,
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
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  secondaryButtonText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#475569",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
    textAlign: "center",
  },
  optionItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  optionText: {
    fontSize: 16,
    color: "#334155",
    textAlign: "center",
  },
});
