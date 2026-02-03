import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Menu from "./src/screens/Menu";
import WarehousingScanningScreen from "./src/screens/WarehousingScanning";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Menu" 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen
          name="WarehousingScanning"
          component={WarehousingScanningScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
