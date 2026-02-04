import React from "react";
import {
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const menuItems = [
  { title: "Warehousing\nScanning", icon: "📦", screen: "WarehousingScanning" },
  { title: "Allocate Out\nWarehouse", icon: "🚚" },
  { title: "Allocate Into\nWarehouse", icon: "🏭" },
  { title: "Warehouse\nDelivery", icon: "📤" },
  { title: "Box / Pallet\nAssembly", icon: "🧱" },
  { title: "Inventory\nVerification", icon: "📋" },
  { title: "Allocate Return\nInto WH", icon: "↩️" },
  { title: "Pallet\nSearch", icon: "🔍" },
  { title: "Not In\nWare", icon: "❌" },
  { title: "Delivery\nReturn", icon: "🔄" },
  { title: "Distributor\nReturn", icon: "🏢" },
  { title: "SN\nReturn", icon: "🔁" },
  { title: "Delivery\nSAP", icon: "💻" },
  { title: "Allocate Out\nSAP", icon: "📡" },
];

export default function Menu() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Warehouse PDA</Text>

      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              !item.screen && styles.disabledCard,
            ]}
            activeOpacity={0.8}
            disabled={!item.screen}
            onPress={() => item.screen && navigation.navigate(item.screen)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.exitButton}
      onPress={() => navigation.goBack()}>
        <Text style={styles.exitText}>EXIT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#E0F2FE",
    flexGrow: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E3A8A",
    marginBottom: 15,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: "center",
    elevation: 4,
  },

  disabledCard: {
    opacity: 0.4,
  },

  icon: {
    fontSize: 28,
    marginBottom: 6,
  },

  cardText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#1E40AF",
  },

  exitButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },

  exitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
