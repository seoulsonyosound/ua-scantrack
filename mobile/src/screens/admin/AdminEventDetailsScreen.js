import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { PrimaryButton } from "../../components/PrimaryButton";

export function AdminEventDetailsScreen({ navigation, route }) {
  const event = route?.params?.event;

  if (!event) {
    return (
      <SafeAreaView style={{ padding: 16 }}>
        <Text>No event data.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "900" }}>{event.title}</Text>

      <Text style={{ color: "#374151" }}>
        {event.event_date} • {event.start_time} - {event.end_time}
      </Text>

      <Text style={{ color: "#374151" }}>{event.venue}</Text>
      {!!event.description && <Text>{event.description}</Text>}

      <View
        style={{
          marginTop: 10,
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <Text style={{ color: "#6b7280", fontWeight: "800" }}>EVENT PIN</Text>
        <Text style={{ fontSize: 44, fontWeight: "900", letterSpacing: 6 }}>
          {event.pin_code}
        </Text>
      </View>

      <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}