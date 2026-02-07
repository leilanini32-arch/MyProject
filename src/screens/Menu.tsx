import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

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

export default function Menu({ navigation }: any) {
  const handleNavigation = (item: any) => {
    if (item.screen) {
      navigation?.navigate
        ? navigation.navigate(item.screen)
        : Alert.alert("Navigation", item.title);
    } else {
      Alert.alert(
        "Restricted Access",
        "This module is currently undergoing maintenance."
      );
    }
  };

  const handleExit = () => {
    Alert.alert(
      "Confirm Exit",
      "Are you sure you want to terminate the current session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () =>
            navigation?.goBack ? navigation.goBack() : null,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Warehouse Management</Text>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleExit}
          activeOpacity={0.8}
        >
             <Text style={styles.logoutLabel}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIndicator} />
          <Text style={styles.sectionTitle}>Operations Console</Text>
        </View>

        <View style={styles.grid}>
          {menuItems.map((item, index) => {
            const isEnabled = !!item.screen;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card,
                  !isEnabled && styles.disabledCard,
                ]}
                activeOpacity={0.7}
                disabled={!isEnabled}
                onPress={() => handleNavigation(item)}
              >
                <View
                  style={[
                    styles.iconBox,
                    !isEnabled && styles.disabledIconBox,
                  ]}
                >
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>

                <Text
                  style={[
                    styles.cardText,
                    !isEnabled && styles.disabledText,
                  ]}
                >
                  {item.title}
                </Text>

                {isEnabled && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* FOOTER LOGOUT */}
        <TouchableOpacity
          style={styles.exitButton}
          activeOpacity={0.8}
          onPress={handleExit}
        >
          <Text style={styles.exitText}>TERMINATE SESSION</Text>
        </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>Authorized Personal Only</Text>
          <Text style={styles.footerText}>Secure Connection Active</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#1E1B4B",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  logoutButton: {
    width: 70,
    height: 40,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    marginLeft: 20,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    backgroundColor: "#4F46E5",
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: (width - 56) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  disabledCard: {
    opacity: 0.5,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  disabledIconBox: {
    opacity: 0.3,
  },
  icon: {
    fontSize: 34,
  },
  cardText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  disabledText: {
    color: "#94A3B8",
  },
  activeDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4F46E5",
  },
  exitButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    borderRadius: 24,
    marginTop: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
  },
  exitText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "900",
  },
  footerInfo: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    color: "#94A3B8",
    fontSize: 10,
  },
  logoutLabel: {
  color: '#FFFFFF',
  fontSize: 12,
  fontWeight: '900',
  letterSpacing: 1,
},
});
