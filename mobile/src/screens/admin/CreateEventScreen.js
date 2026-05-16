import React, { useState, useEffect, useRef } from "react";
import { 
  Alert, SafeAreaView, Text, TextInput, View, ScrollView, 
  Pressable, ActivityIndicator, Animated, Easing 
} from "react-native";
import { createEvent } from "../../api/events";
import styles, { COLORS } from "../../styles/styles";
import { formatTime24H } from "../../utils/time";

export function CreateEventScreen({ navigation, route }) {
  const onDone = route.params?.onDone;
  const [busy, setBusy] = useState(false);
  const shapeRotation = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    event_date: new Date().toISOString().split('T')[0],
    start_time: "08:00 AM",
    end_time: "05:00 PM",
    pin_code: "", 
    pin_enabled: true
  });

  useEffect(() => {
    Animated.loop(
      Animated.timing(shapeRotation, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setForm(prev => ({ ...prev, pin_code: randomPin }));
  }, []);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  async function onCreate() {
    if (!form.title || !form.venue) {
      Alert.alert("Required", "Title and Venue are required.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        start_time: formatTime24H(form.start_time),
        end_time: formatTime24H(form.end_time)
      };
      await createEvent(payload); 
      Alert.alert("Success", "Event created!");
      if (route.params?.onDone) route.params.onDone();
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", JSON.stringify(e.response?.data) || "Creation failed.");
    } finally {
      setBusy(false);
    }
  }

  const spin = shapeRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.headerSection}>
          <View style={{ height: 4, width: 40, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 12 }} />
          <Text style={[styles.kicker, { letterSpacing: 4 }]}>INITIALIZATION</Text>
          <Text style={styles.heroTitle}>Create Event</Text>
        </View>

        <View style={{ backgroundColor: 'white', padding: 25, borderRadius: 28, elevation: 4, marginTop: 20 }}>
          <Text style={styles.fieldLabel}>EVENT TITLE</Text>
          <TextInput style={[styles.borderedInput, { marginBottom: 15 }]} value={form.title} onChangeText={(v) => setField("title", v)} />

          <Text style={styles.fieldLabel}>DESCRIPTION</Text>
          <TextInput style={[styles.borderedInput, { marginBottom: 15, height: 80 }]} multiline value={form.description} onChangeText={(v) => setField("description", v)} />

          <Text style={styles.fieldLabel}>VENUE</Text>
          <TextInput style={[styles.borderedInput, { marginBottom: 15 }]} value={form.venue} onChangeText={(v) => setField("venue", v)} />

          <Text style={styles.fieldLabel}>DATE (YYYY-MM-DD)</Text>
          <TextInput style={[styles.borderedInput, { marginBottom: 15 }]} value={form.event_date} onChangeText={(v) => setField("event_date", v)} />

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 25 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>START (HH:MM AM/PM)</Text>
              <TextInput style={styles.borderedInput} value={form.start_time} onChangeText={(v) => setField("start_time", v)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>END (HH:MM AM/PM)</Text>
              <TextInput style={styles.borderedInput} value={form.end_time} onChangeText={(v) => setField("end_time", v)} />
            </View>
          </View>

          <View style={{ padding: 20, backgroundColor: '#F8FAFC', borderRadius: 20, marginBottom: 30, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#E2E8F0' }}>
             <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8' }}>GENERATED PIN CODE</Text>
             <Text style={{ fontSize: 32, fontWeight: '900', color: COLORS.navy, letterSpacing: 8 }}>{form.pin_code}</Text>
          </View>

          <Pressable onPress={onCreate} disabled={busy} style={{ backgroundColor: COLORS.navy, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}>
            {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900' }}>INITIALIZE EVENT</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
