import React, { useEffect, useState, useRef } from "react";
import { 
  ActivityIndicator, SafeAreaView, Text, Pressable, View, 
  ScrollView, Animated, Easing, Dimensions 
} from "react-native";
import { api } from "../../api/client";
import { PrimaryButton } from "../../components/PrimaryButton";
import styles, { COLORS } from "../../styles/styles";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function EventsListScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(true);

  // Background Animations
  const shapeRotation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.timing(shapeRotation, { toValue: 1, duration: 25000, easing: Easing.linear, useNativeDriver: true })
      ),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true })
    ]).start();

    (async () => {
      try {
        const res = await api.get("/events/upcoming/");
        setEvents(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  const spin = shapeRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const isLargeScreen = SCREEN_WIDTH > 768;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* FULL SPACE BACKGROUND */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <Animated.View style={{ 
          position: 'absolute', width: 500, height: 500, borderRadius: 250, 
          backgroundColor: COLORS.navy, top: -150, left: -150, 
          transform: [{ rotate: spin }], opacity: 0.04 
        }} />
      </View>

      <Animated.ScrollView 
        style={{ flex: 1, zIndex: 1, opacity: fadeAnim }}
        contentContainerStyle={{ 
          padding: isLargeScreen ? 60 : 24, 
          paddingBottom: 120, 
          maxWidth: 1100, 
          alignSelf: 'center', 
          width: '100%' 
        }}
      >
        <View style={{ marginBottom: 40 }}>
          <View style={{ height: 4, width: 30, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 10 }} />
          <Text style={styles.kicker}>UPCOMING</Text>
          <Text style={[styles.heroTitle, { fontSize: isLargeScreen ? 48 : 32, color: COLORS.navy }]}>Events Feed</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {busy ? (
            <ActivityIndicator color={COLORS.navy} size="large" style={{ width: '100%' }} />
          ) : (
            events.map((ev) => (
              <EventTile key={ev.id} ev={ev} navigation={navigation} width={isLargeScreen ? '48.5%' : '100%'} />
            ))
          )}
        </View>
      </Animated.ScrollView>

      <View style={{ padding: 24, backgroundColor: 'transparent', position: 'absolute', bottom: 0, width: '100%', alignItems: 'center', zIndex: 2 }}>
        <View style={{ width: '100%', maxWidth: 400 }}>
          <PrimaryButton title="Back to Dashboard" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

// Separate component for the Spring Hover Effect
const EventTile = ({ ev, navigation, width }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scale, { toValue: 1.03, friction: 4, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], width, marginBottom: 15 }}>
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate("StudentEventDetails", { eventId: ev.id })}
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 24, borderRadius: 24, elevation: 5, 
          flexDirection: 'row', alignItems: 'center', borderLeftWidth: 6, borderLeftColor: COLORS.orange 
        }}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: COLORS.navy }}>{ev.title}</Text>
          <Text style={{ color: COLORS.orange, fontWeight: "800", fontSize: 13, marginTop: 4 }}>{ev.event_date}</Text>
          <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>{ev.venue}</Text>
        </View>
        <View style={{ backgroundColor: COLORS.navy, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
           <Text style={{ color: 'white', fontWeight: '900', fontSize: 10 }}>DETAILS</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};