import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { logout } from "../../utils/logout";

export function AdminHomeScreen({ navigation }) {
  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "900" }}>Admin</Text>

      <View style={{ gap: 10 }}>
        <PrimaryButton title="Manage Events" onPress={() => navigation.navigate("ManageEvents")} />
        <PrimaryButton title="Attendance Records" onPress={() => navigation.navigate("ManageAttendance")} />
        <PrimaryButton title="Reports (CSV)" onPress={() => navigation.navigate("AdminReports")} />
      </View>

      <View style={{ marginTop: 14 }}>
        <PrimaryButton title="Logout" onPress={() => logout(navigation)} />
      </View>
    </SafeAreaView>
  );
}