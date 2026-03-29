import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, SafeAreaView, Text, Pressable, View } from "react-native";
import { deleteAttendance, listAttendance } from "../../api/attendance";
import { PrimaryButton } from "../../components/PrimaryButton";

export function ManageAttendanceScreen() {
  const [busy, setBusy] = useState(true);
  const [records, setRecords] = useState([]);

  async function refresh() {
    setBusy(true);
    try {
      const data = await listAttendance();
      setRecords(data);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onDelete(id) {
    Alert.alert("Delete record?", "This will remove the attendance entry.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAttendance(id);
            await refresh();
          } catch {
            Alert.alert("Failed", "Could not delete.");
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <PrimaryButton title="Refresh" onPress={refresh} />

      {busy ? <ActivityIndicator /> : null}

      <View style={{ gap: 10 }}>
        {records.map((r) => (
          <Pressable
            key={r.id}
            onLongPress={() => onDelete(r.id)}
            style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, gap: 4 }}
          >
            <Text style={{ fontWeight: "900" }}>
              {r.student?.last_name}, {r.student?.first_name} ({r.student?.student_no})
            </Text>
            <Text>Event ID: {r.event} • Status: {r.status}</Text>
            <Text style={{ color: "#6b7280" }}>Time in: {r.time_in}</Text>
            <Text style={{ color: "#9ca3af" }}>(Long-press to delete)</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}