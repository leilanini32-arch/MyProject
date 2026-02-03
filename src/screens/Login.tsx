import React, { useState } from "react";
import {
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";

export default function Login({ navigation }: any) {
  const [classe, setClasse] = useState("");
  const [usercode, setUsercode] = useState("");
  const [password, setPassword] = useState("");
  const [bwdSave, setBwdSave] = useState(false);

  const [open, setOpen] = useState(false);
  const [warehouseApi, setWarehouseApi] = useState<string[]>([]);
  const [items, setItems] = useState([
    { label: "WH A", value: "whA" },
    { label: "WH B", value: "whB" },
    { label: "WH C", value: "whC" },
  ]);

  const fetchUserInfo = async (code: string) => {
    try {
      const response = await fetch(`http://10.0.2.2:3000/users/${code}`);
      const data = await response.json();
      setPassword(data.password);
    } catch {
      setPassword("");
    }
  };

  const handleLogin = () => {
    navigation.navigate("Menu");
  };

  const handleExit = () => {
    // Ici tu peux ajouter une action exit
    console.log("Exit pressed");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Intelligent Warehouse Management</Text>

      {/* Classe */}
      <Text style={styles.label}>Classe</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={classe}
          onValueChange={setClasse}
          style={styles.picker}
        >
          <Picker.Item label="Select Classe..." value="" />
          <Picker.Item label="Classe 1" value="c1" />
          <Picker.Item label="Classe 2" value="c2" />
        </Picker>
      </View>

      {/* Usercode */}
      <Text style={styles.label}>Usercode</Text>
      <TextInput
        placeholder="Scan Usercode"
        value={usercode}
        onChangeText={setUsercode}
        style={styles.input}
        onSubmitEditing={() => fetchUserInfo(usercode)}
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Password"
        value={password}
        style={styles.input}
        editable={false}
      />

      {/* Warehouse API */}
      <Text style={styles.label}>Warehouse API</Text>
      <DropDownPicker
        multiple
        min={0}
        max={items.length}
        open={open}
        value={warehouseApi}
        items={items}
        setOpen={setOpen}
        setValue={setWarehouseApi}
        setItems={setItems}
        containerStyle={styles.dropdownContainer}
        dropDownContainerStyle={styles.dropdownBox}
        textStyle={styles.dropdownText}
      />

      {/* PWD Save */}
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setBwdSave(!bwdSave)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, bwdSave && styles.checkboxChecked]} />
        <Text style={styles.checkboxLabel}>PWD Save</Text>
      </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.loginBtn]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.exitBtn]}
          onPress={handleExit}
        >
          <Text style={styles.buttonText}>EXIT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#E0F2FE",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 6,
  },

  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },

  picker: {
    color: "#1E40AF",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },

  dropdownContainer: {
    marginBottom: 15,
  },

  dropdownBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },

  dropdownText: {
    color: "#1E40AF",
    fontWeight: "600",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: "#fff",
  },

  checkboxChecked: {
    backgroundColor: "#3B82F6",
  },

  checkboxLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 6,
  },

  loginBtn: {
    backgroundColor: "#2563EB",
  },

  exitBtn: {
    backgroundColor: "#DC2626",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
