import React, { useState, useRef, useEffect } from "react";
import { 
  Alert, SafeAreaView, Text, TextInput, View, ScrollView, 
  Pressable, ActivityIndicator, Animated, Easing, Platform 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateEvent } from "../../api/events";
import { session } from "../../session";
import styles, { COLORS } from "../../styles/styles";

export function EditEventScreen({ navigation, route }) {
  const { event, onDone } = route.params;
  const eventId = event.id || event._id;

  const [form, setForm] = useState({
    title: event.title || "",
    venue: event.venue || "",
    event_date: event.event_date || "",
    start_time: event.start_time || "08:00:00",
    end_time: event.end_time || "17:00:00",
  });

  const [busy, setBusy] = useState(false);
  
  // Branded Animation Refs
  const shapeRotation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  
    Animated.parallel([
      Animated.loop(
        Animated.timing(shapeRotation, { 
          toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true 
        })
      ),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true })
    ]).start();
  }, []);

  const spin = shapeRotation.interpolate({ 
    inputRange: [0, 1], outputRange: ['0deg', '360deg'] 
  });

  async function onSave() {
    if (!form.title || !form.venue) {
      Alert.alert("Required", "Please fill in the title and venue.");
      return;
    }
    setBusy(true);
    try {
      await updateEvent(eventId, form);
      Alert.alert("Success", "Database updated!");
      if (onDone) onDone();
      navigation.goBack();
    } catch (e) {
      const serverError = e.response?.data?.detail || "Update failed. Check your login.";
      Alert.alert("Error", serverError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      {/* KINETIC BRANDED BACKGROUND */}
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{ 
          position: 'absolute', width: 600, height: 600, borderRadius: 300, 
          backgroundColor: COLORS.navy, top: -250, right: -250, 
          transform: [{ rotate: spin }], opacity: 0.03 
        }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
      
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 30 }}>
          <View style={{ height: 4, width: 40, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 12 }} />
          <Text style={[styles.kicker, { letterSpacing: 4 }]}>ADMIN CONSOLE</Text>
          <Text style={[styles.heroTitle, { fontSize: 32 }]}>Edit Event</Text>
        </Animated.View>

     
        <Animated.View style={{ 
            opacity: fadeAnim,
            backgroundColor: 'white', 
            padding: 24, 
            borderRadius: 30, 
            elevation: 8,
            shadowColor: COLORS.navy,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12
        }}>
          <Text style={styles.fieldLabel}>EVENT TITLE</Text>
          <TextInput 
            style={[styles.borderedInput, { marginBottom: 20 }]} 
            placeholder="e.g. Technical Seminar"
            value={form.title} 
            onChangeText={(v) => setForm({ ...form, title: v })} 
          />

          <Text style={styles.fieldLabel}>VENUE / LOCATION</Text>
          <TextInput 
            style={[styles.borderedInput, { marginBottom: 20 }]} 
            placeholder="e.g. University Hall"
            value={form.venue} 
            onChangeText={(v) => setForm({ ...form, venue: v })} 
          />

          <Text style={styles.fieldLabel}>DATE (YYYY-MM-DD)</Text>
          <TextInput 
            style={[styles.borderedInput, { marginBottom: 20 }]} 
            value={form.event_date} 
            onChangeText={(v) => setForm({ ...form, event_date: v })} 
          />

          <View style={{ flexDirection: 'row', gap: 15 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>START TIME</Text>
              <TextInput 
                style={styles.borderedInput} 
                value={form.start_time} 
                onChangeText={(v) => setForm({ ...form, start_time: v })} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>END TIME</Text>
              <TextInput 
                style={styles.borderedInput} 
                value={form.end_time} 
                onChangeText={(v) => setForm({ ...form, end_time: v })} 
              />
            </View>
          </View>

          <View style={{ marginTop: 30 }}>
            <Pressable 
              onPress={onSave} 
              disabled={busy} 
              style={({ pressed }) => [
                { 
                  backgroundColor: COLORS.navy, 
                  height: 60, 
                  borderRadius: 18, 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  elevation: 4,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '900', letterSpacing: 1.5 }}>SAVE CHANGES</Text>
              )}
            </Pressable>

            <Pressable 
              onPress={() => navigation.goBack()} 
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ color: COLORS.muted, fontWeight: '700', fontSize: 13 }}>CANCEL AND EXIT</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}