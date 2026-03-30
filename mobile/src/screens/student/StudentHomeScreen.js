// mobile/src/screens/student/StudentHomeScreen.js
import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";
import { logout } from "../../utils/logout";

export function StudentHomeScreen({ navigation }) {
  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "900" }}>Student</Text>

      <View style={{ gap: 10 }}>
        <PrimaryButton title="Upcoming Events" onPress={() => navigation.navigate("StudentEvents")} />
        <PrimaryButton title="My Profile" onPress={() => navigation.navigate("StudentProfile")} />
        <PrimaryButton title="My Attendance History" onPress={() => navigation.navigate("StudentAttendanceHistory")} />
      </View>

      <View style={{ marginTop: 14 }}>
        <PrimaryButton title="Logout" onPress={() => logout(navigation)} />
      </View>
    </SafeAreaView>
  );
}