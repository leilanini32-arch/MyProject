import React, { useState, useEffect } from "react";
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

import { useGlobal } from "../../GlobalContext.tsx";
const { width } = Dimensions.get("window");

const menuItems = [
  { title: "Warehousing\nScanning", icon: "📥", screen: "WarehousingScanning", fcode: "button_in" },
  { title: "Allocate Out\nWarehouse", icon: "🚚", screen: "/", fcode: "button_DBOut" },
  { title: "Allocate Into\nWarehouse", icon: "🏭", screen: "AllocateInNO", fcode: "button_DBIn" },
  { title: "Warehouse\nDelivery", icon: "📦", screen: "/", fcode: "button_fahuo" },
  { title: "Box/Pallet\nDisassembly", icon: "🧩", screen: "BoxPalletDisassembly", fcode: "button_boxChai" },
  { title: "Box/Pallet\nAssembly", icon: "🛠️", screen: "BoxPalletAssembly", fcode: "button_boxZu" },
  { title: "Pallet\nSearch", icon: "🔍", screen: "PalletSearch", fcode: "button_pallerCx" },
  { title: "Not In\nWare", icon: "🚫", screen: "PalletNotIn", fcode: "btnNotIn" },
  { title: "Delivery\nReturn", icon: "🔄", screen: "DeliveryReturn", fcode: "btnDeliveryReturn" },
  { title: "Distributor\nReturn", icon: "🏢", screen: "DistributorReturn", fcode: "btnDistributeReturn" },
  { title: "SN\nReturn", icon: "🔁", screen: "SNReturn", fcode: "btnReturnSN" },
  { title: "Delivery\nSAP", icon: "💻", screen: "DeliverySAP", fcode: "button_fahuoSAP" },
  { title: "Allocate Out\nSAP", icon: "📡", screen: "AllocateSAP", fcode: "button_DBOutSAP" },
  { title: "Allocate Return\nInto WH", icon: "↩️", screen: "AllocateRejectIn", fcode: "btnAllocateRejectIn" },
  { title: "Inventory\nVerification", icon: "📋", screen: "PD", fcode: "button_pd" },
];

export default function Menu({ navigation }: any) {
  const { gsURL, setgs_gsURL } = useGlobal();
  const BASE_URL = gsURL;

  const { gs_roleCode, setgs_roleCode } = useGlobal();
  const { gs_wareType, setgs_wareType } = useGlobal();
  const [allowedMenus, setAllowedMenus] = useState<string[]>([]);

  useEffect(() => {
    const loadMenuByRole = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/MenuListByRolePDA/pbc_MenuListByRolePDA`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roleCode: gs_roleCode,
            }),
          }
        );

        const data = await res.json();

        console.log("MENU RESPONSE:", data);

        if (data.code === 200 && data.data) {
          const codes = data.data.map((m: any) => m.fcode);
          setAllowedMenus(codes);
        }
        console.log("MENU RESPONSE:", allowedMenus);
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Unable to load menu");
      }
    };

    loadMenuByRole();
  }, []);


  const handleNavigation = (item: any) => {
    if (item.screen === "WarehousingScanning" && gs_wareType !== "MainWarehouse") {
      Alert.alert(
        "Restricted Access",
        "Only the main warehouse can be put in storage!"
      );
      return;
    }

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

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment quitter ?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Warehouse Management</Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
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
            // Vérifie si le bouton est autorisé selon son fcode
            //const isEnabled = item.fcode ? allowedMenus.includes(item.fcode) : false;
            const isEnabled = true;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.card, !isEnabled && styles.disabledCard]}
                activeOpacity={0.7}
                disabled={!isEnabled}
                onPress={() => item.screen && handleNavigation(item)}
              >
                <View style={[styles.iconBox, !isEnabled && styles.disabledIconBox]}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>

                <Text style={[styles.cardText, !isEnabled && styles.disabledText]}>
                  {item.title}
                </Text>

                {isEnabled && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.exitButton}
          activeOpacity={0.8}
          onPress={handleLogout}
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


const { height } = Dimensions.get("window");
const isSmallDevice = width < 360;
const scale = (size: number) => (width / 375) * size;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    backgroundColor: "#1E1B4B",
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.03,
    paddingBottom: height * 0.04,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: width * 0.08,
    borderBottomRightRadius: width * 0.08,
    elevation: 6,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? scale(16) : scale(20),
    fontWeight: "900",
  },

  logoutButton: {
    width: width * 0.22,
    height: height * 0.05,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    marginLeft: width * 0.03,
  },

  logoutLabel: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? scale(9) : scale(11),
    fontWeight: "900",
    letterSpacing: 1,
  },

  scrollContainer: {
    padding: width * 0.05,
    paddingBottom: height * 0.05,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02,
  },

  sectionIndicator: {
    width: 4,
    height: 16,
    backgroundColor: "#4F46E5",
    borderRadius: 2,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: isSmallDevice ? scale(10) : scale(12),
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
    width: width < 400 ? "48%" : "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: width * 0.06,
    paddingVertical: height * 0.03,
    marginBottom: height * 0.02,
    alignItems: "center",
  },

  disabledCard: {
    opacity: 0.5,
  },

  iconBox: {
    width: isSmallDevice ? 45 : 55,
    height: isSmallDevice ? 45 : 55,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  disabledIconBox: {
    opacity: 0.3,
  },

  icon: {
    fontSize: isSmallDevice ? scale(20) : scale(26),
  },

  cardText: {
    fontSize: isSmallDevice ? scale(10) : scale(12),
    fontWeight: "700",
    textAlign: "center",
  },

  disabledText: {
    color: "#94A3B8",
  },

  activeDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4F46E5",
  },

  exitButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: height * 0.025,
    borderRadius: 20,
    marginTop: height * 0.03,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
  },

  exitText: {
    color: "#EF4444",
    fontSize: isSmallDevice ? scale(11) : scale(13),
    fontWeight: "900",
  },

  footerInfo: {
    marginTop: height * 0.04,
    alignItems: "center",
  },

  footerText: {
    color: "#94A3B8",
    fontSize: isSmallDevice ? scale(8) : scale(10),
  },
});
