import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { getEvent } from "../../api/events";
import { PrimaryButton } from "../../components/PrimaryButton";

export function StudentEventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEvent(eventId);
        setEvent(data);
      } finally {
        setBusy(false);
      }
    })();
  }, [eventId]);

  if (busy) {
    return (
      <SafeAreaView style={{ padding: 16, gap: 12 }}>
        <ActivityIndicator />
        <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={{ padding: 16, gap: 12 }}>
        <Text>Event not found.</Text>
        <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "900" }}>{event.title}</Text>
      <Text style={{ color: "#374151" }}>
        {event.event_date} • {event.start_time}-{event.end_time}
      </Text>
      <Text style={{ color: "#6b7280" }}>{event.venue}</Text>
      <Text>{event.description || "No description."}</Text>

      <PrimaryButton
        title="View Attendees"
        onPress={() => navigation.navigate("Attendees", { eventId: event.id })}
      />

      <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}