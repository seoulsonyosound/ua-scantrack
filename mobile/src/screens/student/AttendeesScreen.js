import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { listAttendance } from "../../api/attendance";

export function AttendeesScreen({ route }) {
  const { eventId } = route.params;
  const [busy, setBusy] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await listAttendance();
        setRecords(data);
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  const attendees = useMemo(() => {
    return records
      .filter((r) => String(r.event) === String(eventId))
      .map((r) => r.student);
  }, [records, eventId]);

  return (
    <SafeAreaView style={{ padding: 16 }}>
      {busy ? <ActivityIndicator /> : null}

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Attendees ({attendees.length})</Text>
        {attendees.map((s) => (
          <View
            key={s.id}
            style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12 }}
          >
            <Text style={{ fontWeight: "800" }}>
              {s.last_name}, {s.first_name}
            </Text>
            <Text>{s.student_no}</Text>
            <Text style={{ color: "#6b7280" }}>
              {s.course} • Year {s.year_level}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}