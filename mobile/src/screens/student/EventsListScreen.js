import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, Pressable, View } from "react-native";
import { api } from "../../api/client";
import { PrimaryButton } from "../../components/PrimaryButton";

export function EventsListScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/events/upcoming/");
        setEvents(res.data);
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      {busy ? <ActivityIndicator /> : null}

      <View style={{ gap: 10 }}>
        {events.map((ev) => (
          <Pressable
            key={ev.id}
            onPress={() => navigation.navigate("StudentEventDetails", { eventId: ev.id })}
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              padding: 12,
              gap: 4,
            }}
          >
            <Text style={{ fontWeight: "800" }}>{ev.title}</Text>
            <Text style={{ color: "#374151" }}>
              {ev.event_date} • {ev.start_time}-{ev.end_time}
            </Text>
            <Text style={{ color: "#6b7280" }}>{ev.venue}</Text>
          </Pressable>
        ))}
        {!busy && events.length === 0 ? <Text>No upcoming events.</Text> : null}
      </View>

      <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}