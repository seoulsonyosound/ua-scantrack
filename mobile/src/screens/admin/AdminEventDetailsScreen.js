import React, { useEffect, useRef } from "react";
import { SafeAreaView, Text, View, Pressable, ScrollView, Animated, Easing } from "react-native";
import styles, { COLORS } from "../../styles/styles";
import { formatTime12H } from "../../utils/time";

export function AdminEventDetailsScreen({ navigation, route }) {
  const event = route?.params?.event;
  const shapeRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(shapeRotation, { toValue: 1, duration: 25000, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);

  if (!event) return <SafeAreaView style={styles.screen}><Text>No data.</Text></SafeAreaView>;

  const spin = shapeRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: COLORS.navy, top: -150, left: -100, opacity: 0.04, transform: [{ rotate: spin }] }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.headerSection}>
          <View style={{ height: 4, width: 35, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 12 }} />
          <Text style={[styles.kicker, { letterSpacing: 4 }]}>EVENT OVERVIEW</Text>
          <Text style={styles.heroTitle}>{event.title}</Text>
        </View>

        <View style={{ backgroundColor: 'white', padding: 25, borderRadius: 24, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9', marginTop: 20 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 8 }}>LOCATION & SCHEDULE</Text>
          <Text style={{ fontSize: 18, color: COLORS.navy, fontWeight: '700' }}>{event.venue}</Text>
          <Text style={{ fontSize: 14, color: COLORS.orange, fontWeight: '800', marginTop: 2 }}>
            {event.event_date} • {formatTime12H(event.start_time)} - {formatTime12H(event.end_time)}
          </Text>

          <View style={{ padding: 20, backgroundColor: '#F8FAFC', borderRadius: 20, marginVertical: 25, alignItems: 'center' }}>
             <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 2 }}>ACCESS PIN</Text>
             <Text style={{ fontSize: 36, fontWeight: '900', color: COLORS.navy, letterSpacing: 8, marginTop: 5 }}>{event.pin_code}</Text>
          </View>

          <Pressable 
            onPress={() => navigation.navigate("Scanner", { pin: event.pin_code, event: event })}
            style={({ pressed }) => [{ backgroundColor: COLORS.navy, height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', transform: [{ scale: pressed ? 0.98 : 1 }], elevation: 4 }]}
          >
            <Text style={{ color: 'white', fontWeight: '800', letterSpacing: 1 }}>OPEN SCANNER</Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 13 }}>Back to Events</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}