import React, { useState } from "react";
import { Alert, SafeAreaView, Text, TextInput, View } from "react-native";
import { createEvent } from "../../api/events";
import { PrimaryButton } from "../../components/PrimaryButton";

export function CreateEventScreen({ navigation, route }) {
  const onDone = route?.params?.onDone;

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "2026-03-29", // example default; change as needed
    start_time: "08:00:00",
    end_time: "10:00:00",
    venue: "",
  });

  const [busy, setBusy] = useState(false);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onCreate() {
    setBusy(true);
    try {
      const created = await createEvent(form);
      Alert.alert("Created", `Event created.\nPIN: ${created.pin_code}`);
      if (typeof onDone === "function") onDone();
      navigation.goBack();
    } catch (e) {
      Alert.alert("Create failed", e?.response?.data?.detail ?? "Failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "900" }}>New Event</Text>

      <Field label="Title" value={form.title} onChangeText={(v) => setField("title", v)} />
      <Field label="Description" value={form.description} onChangeText={(v) => setField("description", v)} multiline />
      <Field label="Event date (YYYY-MM-DD)" value={form.event_date} onChangeText={(v) => setField("event_date", v)} />
      <Field label="Start time (HH:MM:SS)" value={form.start_time} onChangeText={(v) => setField("start_time", v)} />
      <Field label="End time (HH:MM:SS)" value={form.end_time} onChangeText={(v) => setField("end_time", v)} />
      <Field label="Venue" value={form.venue} onChangeText={(v) => setField("venue", v)} />

      <PrimaryButton title={busy ? "Creating..." : "Create"} onPress={onCreate} disabled={busy} />
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, multiline }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: "#374151" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={!!multiline}
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          padding: 12,
          borderRadius: 10,
          minHeight: multiline ? 80 : undefined,
        }}
      />
    </View>
  );
}