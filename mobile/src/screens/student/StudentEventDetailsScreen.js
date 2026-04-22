import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, SafeAreaView, Text, View, ScrollView, Animated, Easing, Dimensions } from "react-native";
import { getEvent } from "../../api/events";
import { PrimaryButton } from "../../components/PrimaryButton";
import styles, { COLORS } from "../../styles/styles";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function StudentEventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params;
  if (!eventId) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.navy, fontWeight: 'bold' }}>Error: No Event ID provided</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.orange }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }
  const [event, setEvent] = useState(null);
  const [busy, setBusy] = useState(true);

  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const data = await getEvent(eventId);
        setEvent(data);
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1)), useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ]).start();
      } catch (error) { console.error(error); } 
      finally { setBusy(false); }
    })();
  }, []);

  const isLargeScreen = SCREEN_WIDTH > 768;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: COLORS.orange, bottom: -100, right: -100, opacity: 0.06 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 50, paddingBottom: 150, maxWidth: 800, alignSelf: 'center', width: '100%' }}>
        <Text style={styles.kicker}>ACTIVITY OVERVIEW</Text>
        {event && <Text style={[styles.heroTitle, { fontSize: isLargeScreen ? 44 : 32, color: COLORS.navy }]}>{event.title}</Text>}

        {busy ? <ActivityIndicator size="large" style={{ marginTop: 50 }} /> : (
          <Animated.View style={{ 
            backgroundColor: 'rgba(255,255,255,0.85)', padding: isLargeScreen ? 45 : 30, borderRadius: 35, 
            elevation: 10, marginTop: 30, opacity: opacityAnim, transform: [{ translateY: slideAnim }]
          }}>
            <Text style={{ color: COLORS.muted, fontWeight: '900', fontSize: 10 }}>LOCATION</Text>
            <Text style={{ color: COLORS.navy, fontWeight: '800', fontSize: 20, marginBottom: 20 }}>{event.venue}</Text>
            <Text style={{ color: COLORS.muted, fontWeight: '900', fontSize: 10 }}>DESCRIPTION</Text>
            <Text style={{ color: COLORS.ink, lineHeight: 26, marginTop: 10, fontSize: 16 }}>{event.description || "Join us for this exclusive event."}</Text>
          </Animated.View>
        )}
      </ScrollView>

      <View style={{ padding: 24, backgroundColor: 'transparent', position: 'absolute', bottom: 0, width: '100%', alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 450, gap: 12 }}>
          <PrimaryButton title="View Attendees" onPress={() => navigation.navigate("Attendees", { eventId: event?.id })} />
          <PrimaryButton title="Go Back" onPress={() => navigation.goBack()} color="#64748b" />
        </View>
      </View>
    </SafeAreaView>
  );
}