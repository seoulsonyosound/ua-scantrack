import React, { useState, useEffect, useRef } from "react";
import { 
  Alert, SafeAreaView, Text, TextInput, View, ScrollView, 
  Pressable, ActivityIndicator, Animated, Easing, Platform 
} from "react-native";
import { createEvent } from "../../api/events";
import styles, { COLORS } from "../../styles/styles";

export function CreateEventScreen({ navigation, route }) {
  const onDone = route.params?.onDone;
  const [busy, setBusy] = useState(false);
  const shapeRotation = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: new Date().toISOString().split('T')[0],
    start_time: "08:00",
    end_time: "17:00",
    venue: "",
    pin_code: "", 
    pin_enabled: true
  });

  useEffect(() => {
    // Branded Kinetic Background
    Animated.loop(
      Animated.timing(shapeRotation, { 
        toValue: 1, 
        duration: 30000, 
        easing: Easing.linear, 
        useNativeDriver: true 
      })
    ).start();

    // Auto-generate a 4-digit PIN
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setField("pin_code", randomPin);
  }, []);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  async function onCreate() {
    if (!form.title || !form.venue || !form.event_date) {
      Alert.alert("Required", "Please fill in Title, Venue, and Date.");
      return;
    }
    setBusy(true);
    try {
      await createEvent(form);
      Alert.alert("Success", "Event initialized successfully.");
      if (onDone) onDone();
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Could not create event. Please check connection.");
    } finally {
      setBusy(false);
    }
  }

  const handleHover = (isHovering) => {
    if (Platform.OS !== 'web') return;
    Animated.spring(buttonScale, { toValue: isHovering ? 1.02 : 1, friction: 8, useNativeDriver: true }).start();
  };

  const spin = shapeRotation.interpolate({ 
    inputRange: [0, 1], 
    outputRange: ['0deg', '360deg'] 
  });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      {/* Branded Kinetic Background */}
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{ 
          position: 'absolute', width: 500, height: 500, borderRadius: 250, 
          backgroundColor: COLORS.navy, top: -150, right: -150, 
          transform: [{ rotate: spin }], opacity: 0.03 
        }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.headerSection}>
          <View style={{ height: 4, width: 40, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 12 }} />
          <Text style={[styles.kicker, { letterSpacing: 4 }]}>INITIALIZATION</Text>
          <Text style={styles.heroTitle}>Create Event</Text>
        </View>

        <View style={{ 
          backgroundColor: 'white', padding: 25, borderRadius: 28, 
          elevation: 4, marginTop: 20, borderWidth: 1, borderColor: '#F1F5F9' 
        }}>
          <Text style={{ color: COLORS.navy, fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 1 }}>EVENT TITLE</Text>
          <TextInput 
            placeholder="e.g. Foundation Day 2026"
            style={[styles.borderedInput, { borderRadius: 14, marginBottom: 20, padding: 16 }]} 
            value={form.title} 
            onChangeText={(v) => setField("title", v)} 
          />

          <Text style={{ color: COLORS.navy, fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 1 }}>VENUE</Text>
          <TextInput 
            placeholder="e.g. University Gym"
            style={[styles.borderedInput, { borderRadius: 14, marginBottom: 20, padding: 16 }]} 
            value={form.venue} 
            onChangeText={(v) => setField("venue", v)} 
          />

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 25 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.navy, fontSize: 11, fontWeight: '800', marginBottom: 8 }}>START TIME</Text>
              <TextInput 
                style={[styles.borderedInput, { borderRadius: 14, padding: 16 }]} 
                value={form.start_time} 
                onChangeText={(v) => setField("start_time", v)} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.navy, fontSize: 11, fontWeight: '800', marginBottom: 8 }}>END TIME</Text>
              <TextInput 
                style={[styles.borderedInput, { borderRadius: 14, padding: 16 }]} 
                value={form.end_time} 
                onChangeText={(v) => setField("end_time", v)} 
              />
            </View>
          </View>

          <View style={{ padding: 20, backgroundColor: '#F8FAFC', borderRadius: 20, marginBottom: 30, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' }}>
             <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 2 }}>GENERATED PIN CODE</Text>
             <Text style={{ fontSize: 32, fontWeight: '900', color: COLORS.navy, letterSpacing: 8, marginTop: 5 }}>{form.pin_code}</Text>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable 
              onMouseEnter={() => handleHover(true)}
              onMouseLeave={() => handleHover(false)}
              onPress={onCreate}
              disabled={busy}
              style={({ pressed }) => [
                { 
                  backgroundColor: COLORS.navy, height: 60, borderRadius: 18, 
                  justifyContent: 'center', alignItems: 'center', elevation: 6
                },
                pressed && { transform: [{ scale: 0.97 }], elevation: 2 }
              ]}
            >
              {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900', letterSpacing: 1.5 }}>INITIALIZE EVENT</Text>}
            </Pressable>
          </Animated.View>

          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 13 }}>Cancel and Return</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}