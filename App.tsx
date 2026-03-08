import React from "react";
import { GlobalProvider } from "./GlobalContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./src/screens/Login";
import Menu from "./src/screens/Menu";
//InWharHouse
import WarehousingScanningScreen from "./src/screens/WarehousingScanning";
import ConfirmBox from "./src/screens/ConfirmBox";
import DetailBox from "./src/screens/DetailBox";
import WSdetail from "./src/screens/wsdetail";

//DeliverySAP
import DeliverySAP from "./src/Delivery/DeliverySAP";
import DeliveryFrm from "./src/Delivery/DeliveryFrm";
import DeliverySNConfirmBox from "./src/Delivery/DeliverySNConfirmBox";
import DeliverySNConfirm from "./src/Delivery/DeliverySNConfirm";
import DeliverySNBox from "./src/Delivery/DeliverySNBox";
import DeliverySN from "./src/Delivery/DeliverySN";

//AllocateoutSAP
import AllocateSAP from "./src/Allocateout/AllocateSAP";
import AllocateFrm from "./src/Allocateout/AllocateFrm";
import AllocateSNConfirmBox from "./src/Allocateout/AllocateSNConfirmBox";
import AllocateSNConfirm from "./src/Allocateout/AllocateSNConfirm";
import AllocateSNBox from "./src/Allocateout/AllocateSNBox";
import AllocateSN from "./src/Allocateout/AllocateSN";

//AllocateIn
import AllocateInNO from "./src/AllocateIN/AllocateInNo";
import AllocateInFrm from "./src/AllocateIN/AllocateInFrm";
import AllocateInSNConfirmBox from "./src/AllocateIN/AllocateInSNConfirmBox";
import AllocateInSNConfirm from "./src/AllocateIN/AllocateInSNConfirm";
import AllocateInSNBox from "./src/AllocateIN/AllocateInSNBox";
import AllocateInSN from "./src/AllocateIN/AllocateInSN";

//AllocateRejectIn
import AllocateRejectIn from "./src/AllocateRejectIn/AllocateRejectIn";
import AllocateRejectInSNConfirmBox from "./src/AllocateRejectIn/AllocateRejectInSNConfirmBox";
import AllocateRejectInSNConfirm from "./src/AllocateRejectIn/AllocateRejectInSNConfirm";

//PalletSearch
import PalletSearch from "./src/PalletSearch/PalletSearch";
import PalletSNDetails from "./src/PalletSearch/PalletSNDetails";


//PalletnotIn
import PalletNotIn from "./src/PalletNotIn/PalletNotIn";
import PalletNotInBox from "./src/PalletNotIn/PalletNotInBox";
import PalletNotInSN from "./src/PalletNotIn/PalletNotInSN";

//Inventory
import PD from "./src/Inventory/PD";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GlobalProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Menu" component={Menu} />


          <Stack.Screen name="WarehousingScanning" component={WarehousingScanningScreen} />
          <Stack.Screen name="ConfirmBox" component={ConfirmBox} />
          <Stack.Screen name="DetailBox" component={DetailBox} />
          <Stack.Screen name="WSdetail" component={WSdetail} />


          <Stack.Screen name="DeliverySAP" component={DeliverySAP} />
          <Stack.Screen name="DeliveryFrm" component={DeliveryFrm} />
          <Stack.Screen name="DeliverySNConfirmBox" component={DeliverySNConfirmBox} />
          <Stack.Screen name="DeliverySNConfirm" component={DeliverySNConfirm} />
          <Stack.Screen name="DeliverySNBox" component={DeliverySNBox} />
          <Stack.Screen name="DeliverySN" component={DeliverySN} />

          <Stack.Screen name="AllocateSAP" component={AllocateSAP} />
          <Stack.Screen name="AllocateFrm" component={AllocateFrm} />
          <Stack.Screen name="AllocateSNConfirmBox" component={AllocateSNConfirmBox} />
          <Stack.Screen name="AllocateSNConfirm" component={AllocateSNConfirm} />
          <Stack.Screen name="AllocateSNBox" component={AllocateSNBox} />
          <Stack.Screen name="AllocateSN" component={AllocateSN} />

          <Stack.Screen name="AllocateInNO" component={AllocateInNO} />
          <Stack.Screen name="AllocateInFrm" component={AllocateInFrm} />
          <Stack.Screen name="AllocateInSNConfirmBox" component={AllocateInSNConfirmBox} />
          <Stack.Screen name="AllocateInSNConfirm" component={AllocateInSNConfirm} />
          <Stack.Screen name="AllocateInSNBox" component={AllocateInSNBox} />
          <Stack.Screen name="AllocateInSN" component={AllocateInSN} />

          <Stack.Screen name="AllocateRejectIn" component={AllocateRejectIn} />
          <Stack.Screen name="AllocateRejectInSNConfirmBox" component={AllocateRejectInSNConfirmBox} />
          <Stack.Screen name="AllocateRejectInSNConfirm" component={AllocateRejectInSNConfirm} />

          <Stack.Screen name="PalletSearch" component={PalletSearch} />
          <Stack.Screen name="PalletSNDetails" component={PalletSNDetails} />

          <Stack.Screen name="PalletNotIn" component={PalletNotIn} />
          <Stack.Screen name="PalletNotInBox" component={PalletNotInBox} />
          <Stack.Screen name="PalletNotInSN" component={PalletNotInSN} />

          <Stack.Screen name="PD" component={PD} />



        </Stack.Navigator>
      </NavigationContainer>
    </GlobalProvider>
  );
}
