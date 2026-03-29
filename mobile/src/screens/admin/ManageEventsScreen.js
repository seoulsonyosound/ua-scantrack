import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, Pressable, View } from "react-native";
import { listEvents } from "../../api/events";
import { PrimaryButton } from "../../components/PrimaryButton";

export function ManageEventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(true);

  async function refresh() {
    setBusy(true);
    try {
      const data = await listEvents();
      setEvents(data);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <PrimaryButton title="Create Event" onPress={() => navigation.navigate("CreateEvent", { onDone: refresh })} />

      {busy ? <ActivityIndicator /> : null}

      <View style={{ gap: 10 }}>
        {events.map((ev) => (
          <Pressable
            key={ev.id}
            style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, gap: 4 }}
          >
            <Text style={{ fontWeight: "900" }}>{ev.title}</Text>
            <Text style={{ color: "#374151" }}>
              {ev.event_date} • {ev.start_time}-{ev.end_time}
            </Text>
            <Text style={{ color: "#6b7280" }}>
              Venue: {ev.venue} • PIN: {ev.pin_code} ({ev.pin_enabled ? "Enabled" : "Disabled"})
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}