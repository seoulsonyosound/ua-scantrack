import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";

export function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>UA Scan&Track</Text>
      <Text style={{ color: "#6b7280" }}>
        Select mode (temporary). Add authentication later.
      </Text>

      <View style={{ gap: 10 }}>
        <PrimaryButton title="Student" onPress={() => navigation.navigate("StudentEvents")} />
        <PrimaryButton title="Admin" onPress={() => navigation.navigate("AdminHome")} />
        <PrimaryButton title="Student Admin (PIN Scanner)" onPress={() => navigation.navigate("PinLogin")} />
      </View>
    </SafeAreaView>
  );
}