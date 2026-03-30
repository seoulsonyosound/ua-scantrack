// mobile/src/screens/student/StudentProfileScreen.js
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";

import { getStudentMe } from "../../api/auth";
import { session } from "../../session";
import { logout } from "../../utils/logout";
import { PrimaryButton } from "../../components/PrimaryButton";

export function StudentProfileScreen({ navigation }) {
  const [busy, setBusy] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const email = session?.user?.email;
        if (!email) {
          throw new Error("No logged-in student. Please log in again.");
        }

        const data = await getStudentMe(email);
        if (!cancelled) setProfile(data);
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.detail ?? e?.message ?? "Failed to load profile.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      {busy ? <ActivityIndicator /> : null}

      {error ? <Text style={{ color: "#ef4444" }}>{error}</Text> : null}

      {profile ? (
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 18, fontWeight: "900" }}>
            {profile.last_name}, {profile.first_name}
          </Text>
          <Text>Student No: {profile.student_no}</Text>
          <Text>Course: {profile.course}</Text>
          <Text>Year Level: {profile.year_level}</Text>
        </View>
      ) : !busy && !error ? (
        <Text>No profile found.</Text>
      ) : null}

      <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}