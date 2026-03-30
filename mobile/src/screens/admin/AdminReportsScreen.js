import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, Text, View, Pressable } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { listEvents } from "../../api/events";
import { downloadReportCsv, downloadAttendeesCsv } from "../../api/reports";
import { PrimaryButton } from "../../components/PrimaryButton";

export function AdminReportsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await listEvents();
        setEvents(data);
      } catch (e) {
        Alert.alert("Failed", e?.response?.data?.detail ?? "Could not load events.");
      }
    })();
  }, []);

  async function shareCsv({ csvText, filename }) {
    const uri = FileSystem.documentDirectory + filename;

    // ✅ legacy API (no deprecation crash) + no EncodingType
    await FileSystem.writeAsStringAsync(uri, csvText);

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert("Saved", `CSV saved to:\n${uri}`);
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: "text/csv",
      dialogTitle: "Share CSV",
      UTI: "public.comma-separated-values-text",
    });
  }

  async function download(type, ev) {
    setBusyId(ev.id);
    try {
      if (type === "attendance") {
        const csvText = await downloadReportCsv(ev.id);
        await shareCsv({ csvText, filename: `attendance_event_${ev.id}_${ev.event_date}.csv` });
      } else {
        const csvText = await downloadAttendeesCsv(ev.id);
        await shareCsv({ csvText, filename: `attendees_event_${ev.id}_${ev.event_date}.csv` });
      }
    } catch (e) {
      Alert.alert("Failed", String(e?.message ?? e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "900" }}>Reports (CSV)</Text>

      <View style={{ gap: 10 }}>
        {events.map((ev) => (
          <View
            key={ev.id}
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              padding: 12,
              gap: 8,
            }}
          >
            <Text style={{ fontWeight: "900" }}>{ev.title}</Text>
            <Text style={{ color: "#6b7280" }}>
              {ev.event_date} • {ev.venue}
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                disabled={busyId === ev.id}
                onPress={() => download("attendance", ev)}
                style={{
                  flex: 1,
                  backgroundColor: busyId === ev.id ? "#9ca3af" : "#111827",
                  padding: 10,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>{busyId === ev.id ? "..." : "Attendance CSV"}</Text>
              </Pressable>

              <Pressable
                disabled={busyId === ev.id}
                onPress={() => download("attendees", ev)}
                style={{
                  flex: 1,
                  backgroundColor: busyId === ev.id ? "#9ca3af" : "#111827",
                  padding: 10,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>{busyId === ev.id ? "..." : "Attendees CSV"}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}