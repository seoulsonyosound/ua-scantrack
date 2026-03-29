// mobile/src/screens/student/StudentAttendanceHistoryScreen.js
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { getMyAttendance } from "../../api/auth";
import { session } from "../../session";

export function StudentAttendanceHistoryScreen() {
  const [busy, setBusy] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyAttendance(session.user.email);
        setRecords(data);
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "900" }}>My Attendance</Text>
      {busy ? <ActivityIndicator /> : null}

      <View style={{ gap: 10 }}>
        {records.map((r) => (
          <View key={r.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, gap: 4 }}>
            <Text style={{ fontWeight: "900" }}>{r.event}</Text>
            <Text>Status: {r.status}</Text>
            <Text style={{ color: "#6b7280" }}>{r.time_in}</Text>
          </View>
        ))}
        {!busy && records.length === 0 ? <Text>No attendance records yet.</Text> : null}
      </View>
    </SafeAreaView>
  );
}