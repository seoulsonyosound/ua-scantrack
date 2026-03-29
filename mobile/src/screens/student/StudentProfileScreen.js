// mobile/src/screens/student/StudentProfileScreen.js
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { getStudentMe } from "../../api/auth";
import { session } from "../../session";

export function StudentProfileScreen() {
  const [busy, setBusy] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getStudentMe(session.user.email);
        setProfile(data);
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      {busy ? <ActivityIndicator /> : null}
      {profile ? (
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 18, fontWeight: "900" }}>
            {profile.last_name}, {profile.first_name}
          </Text>
          <Text>Student No: {profile.student_no}</Text>
          <Text>Course: {profile.course}</Text>
          <Text>Year Level: {profile.year_level}</Text>
        </View>
      ) : (
        !busy ? <Text>No profile found.</Text> : null
      )}
    </SafeAreaView>
  );
}