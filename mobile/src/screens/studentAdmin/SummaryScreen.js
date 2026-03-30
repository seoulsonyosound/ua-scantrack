import React, { useState } from "react";
import { Alert, SafeAreaView, Text, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { logout } from "../../utils/logout";

import { downloadReportCsv } from "../../api/reports";

export function SummaryScreen({ route, navigation }) {
  const { pin, event, stats, last } = route.params;
  const [busy, setBusy] = useState(false);

  async function onDownloadCsv() {
    setBusy(true);
    try {
      const csvText = await downloadReportCsv(event?.id);

      const safeDate = String(event?.event_date ?? "unknown-date");
      const safeTitle = String(event?.title ?? "event").replace(/[^a-z0-9-_]+/gi, "_");
      const filename = `attendance_${safeTitle}_${safeDate}.csv`;

      const uri = FileSystem.documentDirectory + filename;

      // ✅ legacy API (no deprecation crash) + no EncodingType
      await FileSystem.writeAsStringAsync(uri, csvText);

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Saved", `CSV saved to:\n${uri}\n\n(Sharing not available on this device)`);
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "text/csv",
        dialogTitle: "Share attendance CSV",
        UTI: "public.comma-separated-values-text",
      });
    } catch (e) {
      // show real error
      Alert.alert("Download failed", String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "800" }}>Summary</Text>

      <View style={{ padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, gap: 6 }}>
        <Text style={{ fontWeight: "700" }}>{event?.title}</Text>
        <Text>
          {event?.event_date} • {event?.venue}
        </Text>
        <Text style={{ color: "#6b7280" }}>PIN: {pin}</Text>
      </View>

      <View style={{ padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, gap: 6 }}>
        <Text style={{ fontWeight: "700" }}>Current session counts (device-local)</Text>
        <Text>Present: {stats?.present ?? 0}</Text>
        <Text>Late: {stats?.late ?? 0}</Text>
        <Text>Errors: {stats?.errors ?? 0}</Text>
      </View>

      <View style={{ padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, gap: 6 }}>
        <Text style={{ fontWeight: "700" }}>Last scanned</Text>
        <Text>
          {last ? `${last.student.first_name} ${last.student.last_name} (${last.student.student_no})` : "None"}
        </Text>
        <Text>{last ? `Status: ${last.status}` : ""}</Text>
      </View>

      <PrimaryButton title={busy ? "Preparing CSV..." : "Download / Share CSV"} onPress={onDownloadCsv} disabled={busy} />

      <PrimaryButton title="Back to Scanner" onPress={() => navigation.goBack()} />
      <PrimaryButton title="Exit (Change Event)" onPress={() => navigation.replace("PinLogin")} />
      <PrimaryButton title="Logout" onPress={() => logout(navigation)} />
    </SafeAreaView>
  );
}