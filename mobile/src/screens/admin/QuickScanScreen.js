import React, { useEffect, useState, useRef } from "react";
import { 
  ActivityIndicator, SafeAreaView, Text, Pressable, View, 
  Alert, ScrollView, Animated, Easing, RefreshControl, Platform 
} from "react-native";
import { listEvents } from "../../api/events";
import styles, { COLORS } from "../../styles/styles";

export function QuickScanScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(true);
  const shapeRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Branded Kinetic Background
    Animated.loop(
      Animated.timing(shapeRotation, { 
        toValue: 1, 
        duration: 35000, 
        easing: Easing.linear, 
        useNativeDriver: true 
      })
    ).start();
    refresh();
  }, []);

  async function refresh() {
    setBusy(true);
    try {
      const data = await listEvents();
      setEvents(data || []);
    } catch (e) {
      Alert.alert("Error", "Could not load active events.");
    } finally {
      setBusy(false);
    }
  }

  const spin = shapeRotation.interpolate({ 
    inputRange: [0, 1], 
    outputRange: ['0deg', '360deg'] 
  });

  // Animated Card Component for Sleek Hover & Press
  const QuickScanCard = ({ item, index }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Staggered entry animation
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 50, delay: index * 100, useNativeDriver: true })
      ]).start();
    }, []);

    const handleHover = (isHovering) => {
      if (Platform.OS !== 'web') return;
      Animated.spring(scale, { toValue: isHovering ? 1.03 : 1, friction: 7, useNativeDriver: true }).start();
    };

    return (
      <Animated.View style={{ opacity, transform: [{ scale }, { translateY }], marginBottom: 16 }}>
        <Pressable 
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
          onPress={() => navigation.navigate("Scanner", { pin: item.pin_code, event: item })}
          style={({ pressed }) => [
            { 
              backgroundColor: 'white', padding: 24, borderRadius: 28, 
              borderWidth: 1, borderColor: '#F1F5F9', elevation: 4,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
            },
            pressed && { transform: [{ scale: 0.97 }], backgroundColor: '#FAFBFC', elevation: 2 }
          ]}
        >
          <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: '#FFF7ED', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 }}>
              <Text style={{ color: COLORS.orange, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>ACTIVE SESSION</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.navy }}>{item.title}</Text>
            <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 13, marginTop: 2 }}>{item.venue?.toUpperCase()}</Text>
          </View>
          
          <View style={{ height: 50, width: 50, borderRadius: 25, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center' }}>
             <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>→</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      {/* Branded Kinetic Background Orb */}
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{ 
          position: 'absolute', width: 600, height: 600, borderRadius: 300, 
          backgroundColor: COLORS.navy, top: -200, left: -200, 
          transform: [{ rotate: spin }], opacity: 0.03 
        }} />
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 24 }}
        refreshControl={<RefreshControl refreshing={busy} onRefresh={refresh} tintColor={COLORS.orange} />}
      >
        <View style={styles.headerSection}>
          <View style={{ height: 4, width: 40, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 12 }} />
          <Text style={[styles.kicker, { letterSpacing: 4 }]}>TERMINAL</Text>
          <Text style={styles.heroTitle}>Quick Scan</Text>
          <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '600', marginTop: 4 }}>
            Select an event to begin scanning.
          </Text>
        </View>

        <View style={{ marginTop: 20 }}>
          {busy && events.length === 0 ? (
            <ActivityIndicator color={COLORS.navy} size="large" style={{ marginTop: 50 }} />
          ) : events.length > 0 ? (
            events.map((ev, index) => <QuickScanCard key={ev.id} item={ev} index={index} />)
          ) : (
            <View style={{ marginTop: 80, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8', fontWeight: '800', fontSize: 16 }}>NO ACTIVE EVENTS</Text>
              <Text style={{ color: '#CBD5E1', fontWeight: '600', marginTop: 4 }}>Check back later or create a new session.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}