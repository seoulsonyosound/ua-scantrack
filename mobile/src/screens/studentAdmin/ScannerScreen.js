import React, { useMemo, useState } from "react";
import { Alert, SafeAreaView, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { scanCheckin } from "../../api/attendance";
import { PrimaryButton } from "../../components/PrimaryButton";
import { debounceMs } from "../../utils/debounce";

export function ScannerScreen({ route, navigation }) {
  const { pin, event } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState({ present: 0, late: 0, errors: 0 });
  const [last, setLast] = useState(null);

  const canScan = useMemo(() => !!permission?.granted && !busy, [permission, busy]);

  async function handleScanned({ data, type }) {
    if (!canScan) return;

    // For 1D barcodes, data should be your student_no string.
    const student_no = String(data).trim();
    if (!student_no) return;

    setBusy(true);
    try {
      const record = await scanCheckin({ pin_code: pin, student_no });
      setLast(record);

      setStats((s) => ({
        ...s,
        present: s.present + (record.status === "PRESENT" ? 1 : 0),
        late: s.late + (record.status === "LATE" ? 1 : 0),
      }));

      Alert.alert(
        "Checked in",
        `${record.student.first_name} ${record.student.last_name}\n${record.student.student_no}\nStatus: ${record.status}`
      );
    } catch (e) {
      setStats((s) => ({ ...s, errors: s.errors + 1 }));
      Alert.alert("Scan failed", e?.response?.data?.detail ?? "Failed to check-in.");
    } finally {
      // basic debounce so you don’t double-scan
      await debounceMs(800);
      setBusy(false);
    }
  }

  if (!permission) return <SafeAreaView style={{ flex: 1 }} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Camera permission required</Text>
        <PrimaryButton title="Grant permission" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 12, gap: 4, borderBottomWidth: 1, borderColor: "#e5e7eb" }}>
        <Text style={{ fontSize: 16, fontWeight: "700" }}>{event?.title}</Text>
        <Text style={{ color: "#374151" }}>
          {event?.event_date} • {event?.start_time}–{event?.end_time} • {event?.venue}
        </Text>
        <Text style={{ color: "#6b7280" }}>PIN locked: {pin}</Text>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <Text>Present: {stats.present}</Text>
          <Text>Late: {stats.late}</Text>
          <Text>Errors: {stats.errors}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          onBarcodeScanned={handleScanned}
          barcodeScannerSettings={{
            // 1D formats; keep qr removed if you only want 1D
            barcodeTypes: ["code128", "code39", "ean13", "ean8", "upc_a", "upc_e", "itf14", "codabar"],
          }}
        />
      </View>

      <View style={{ padding: 12, gap: 8, borderTopWidth: 1, borderColor: "#e5e7eb" }}>
        <Text style={{ color: "#374151" }}>
          Last scan:{" "}
          {last ? `${last.student.student_no} (${last.status})` : "None"}
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title="View Summary"
              onPress={() =>
                navigation.navigate("Summary", {
                  pin,
                  event,
                  stats,
                  last,
                })
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title="Change Event PIN"
              onPress={() => navigation.replace("PinLogin")}
            />
          </View>
        </View>

        {busy ? <Text style={{ color: "#6b7280" }}>Scanning locked…</Text> : null}
      </View>
    </SafeAreaView>
  );
}