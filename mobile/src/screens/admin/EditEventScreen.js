import React, { useState, useEffect } from "react";
import { 
  Alert, SafeAreaView, Text, TextInput, View, ScrollView, 
  Pressable, ActivityIndicator 
} from "react-native";
import { updateEvent } from "../../api/events";
import styles, { COLORS } from "../../styles/styles";
import { formatTime12H, formatTime24H } from "../../utils/time";

export function EditEventScreen({ navigation, route }) {
  const { event, onDone } = route.params;
  const eventId = event.id || event._id;

  // State initialized with existing event data, formatted to 12H
  const [form, setForm] = useState({
    title: event.title || "",
    description: event.description || "",
    venue: event.venue || "",
    event_date: event.event_date || "",
    start_time: formatTime12H(event.start_time) || "08:00 AM",
    end_time: formatTime12H(event.end_time) || "05:00 PM",
  });

  const [busy, setBusy] = useState(false);

  async function onSave() {
    if (!form.title || !form.venue) {
      Alert.alert("Required", "Title and Venue are required.");
      return;
    }
    setBusy(true);
    try {
      // Prepare payload with converted times
      const payload = {
        ...form,
        start_time: formatTime24H(form.start_time),
        end_time: formatTime24H(form.end_time)
      };
      
      await updateEvent(eventId, payload);
      Alert.alert("Success", "Event updated!");
      if (onDone) onDone();
      navigation.goBack();
    } catch (e) {
      const err = e.response?.data ? JSON.stringify(e.response.data) : "Update failed.";
      Alert.alert("Error", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={{ marginBottom: 30 }}>
          <View style={{ height: 4, width: 40, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 12 }} />
          <Text style={[styles.kicker, { letterSpacing: 4 }]}>ADMIN CONSOLE</Text>
          <Text style={styles.heroTitle}>Edit Event</Text>
        </View>

        <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 30, elevation: 8 }}>
          <Text style={styles.fieldLabel}>EVENT TITLE</Text>
          <TextInput 
            style={[styles.borderedInput, { marginBottom: 15 }]} 
            value={form.title} 
            onChangeText={(v) => setForm({...form, title: v})} 
          />

          <Text style={styles.fieldLabel}>DESCRIPTION</Text>
          <TextInput 
            style={[styles.borderedInput, { marginBottom: 15, height: 60 }]} 
            multiline 
            value={form.description} 
            onChangeText={(v) => setForm({...form, description: v})} 
          />

          <Text style={styles.fieldLabel}>VENUE</Text>
          <TextInput 
            style={[styles.borderedInput, { marginBottom: 15 }]} 
            value={form.venue} 
            onChangeText={(v) => setForm({...form, venue: v})} 
          />

          <Text style={styles.fieldLabel}>DATE (YYYY-MM-DD)</Text>
          <TextInput 
            style={[styles.borderedInput, { marginBottom: 15 }]} 
            value={form.event_date} 
            onChangeText={(v) => setForm({...form, event_date: v})} 
          />

          <View style={{ flexDirection: 'row', gap: 15 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>START (AM/PM)</Text>
              <TextInput 
                style={styles.borderedInput} 
                placeholder="08:00 AM"
                value={form.start_time} 
                onChangeText={(v) => setForm({...form, start_time: v})} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>END (AM/PM)</Text>
              <TextInput 
                style={styles.borderedInput} 
                placeholder="05:00 PM"
                value={form.end_time} 
                onChangeText={(v) => setForm({...form, end_time: v})} 
              />
            </View>
          </View>

          <Pressable 
            onPress={onSave} 
            disabled={busy} 
            style={{ backgroundColor: COLORS.navy, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}
          >
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: 'white', fontWeight: '900' }}>SAVE CHANGES</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}