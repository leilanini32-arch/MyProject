import React from "react";
import { GlobalProvider } from "./src/screens/GlobalContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./src/screens/Login";
import Menu from "./src/screens/Menu";
import WarehousingScanningScreen from "./src/screens/WarehousingScanning";
import ConfirmBox from "./src/screens/ConfirmBox";
import WSdetail from "./src/screens/wsdetail";

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
        <Stack.Screen
          name="WarehousingScanning"
          component={WarehousingScanningScreen}
        />
        <Stack.Screen name="ConfirmBox" component={ConfirmBox} />
        <Stack.Screen name="WSdetail" component={WSdetail} />
      </Stack.Navigator>
    </NavigationContainer>
    </GlobalProvider>
  );
}
