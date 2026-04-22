import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator, SafeAreaView, Text, Pressable,
  View, ScrollView, Animated, Easing, RefreshControl, Platform
} from "react-native";
import { listAttendance } from "../../api/attendance";
import styles, { COLORS } from "../../styles/styles";

export function ManageAttendanceScreen() {
  const [busy, setBusy] = useState(true);
  const [records, setRecords] = useState([]);
  const shapeRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start background animation
    Animated.loop(
      Animated.timing(shapeRotation, {
        toValue: 1, duration: 40000, easing: Easing.linear, useNativeDriver: true
      })
    ).start();
    refresh();
  }, []);

  async function refresh() {
    setBusy(true);
    try {
      const data = await listAttendance();
      setRecords(data || []);
    } catch (e) {
      console.error("Load failed", e);
    } finally { setBusy(false); }
  }

  const spin = shapeRotation.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '360deg']
  });

  // INTERNAL COMPONENT FOR CARDS WITH EFFECTS
  const AttendanceCard = ({ item }) => {
    const scale = useRef(new Animated.Value(1)).current;

    // Safety check for date formatting
    const formatDate = (dateString) => {
      if (!dateString) return "No Date";
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Just Now" : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleHover = (isHovering) => {
      if (Platform.OS !== 'web') return;
      Animated.spring(scale, { toValue: isHovering ? 1.02 : 1, friction: 8, useNativeDriver: true }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale }], marginBottom: 16 }}>
        <Pressable
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
          style={({ pressed }) => [
            {
              backgroundColor: 'white', padding: 22, borderRadius: 24,
              elevation: 4, borderWidth: 1, borderColor: '#F1F5F9',
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05, shadowRadius: 10
            },
            pressed && { transform: [{ scale: 0.98 }], backgroundColor: '#F8FAFC' }
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.navy }}>
                {item.student?.last_name}, {item.student?.first_name}
              </Text>
              <Text style={{ color: COLORS.orange, fontSize: 11, fontWeight: '800', marginTop: 4 }}>
                ID: {item.student?.student_no}
              </Text>
            </View>
            <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B' }}>
                {formatDate(item.timestamp)}
              </Text>
            </View>
          </View>

          {/* EVENT SECTION */}
          <View style={{ marginTop: 18, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F8FAFC' }}>
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5 }}>
              EVENT LOGGED
            </Text>

            <Text style={{ color: COLORS.navy, fontWeight: '800', fontSize: 14, marginTop: 4 }}>
              {/* This pulls the specific event name from your scan record */}
              {item.event?.title || item.event_name || "General Attendance"}
            </Text>

            <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 2 }}>
              {item.event?.venue || item.location || "Main Campus"}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      {/* KINETIC BACKGROUND EFFECT */}
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{
          position: 'absolute', width: 600, height: 600, borderRadius: 300,
          backgroundColor: COLORS.navy, bottom: -200, right: -200,
          transform: [{ rotate: spin }], opacity: 0.03
        }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        refreshControl={<RefreshControl refreshing={busy} onRefresh={refresh} tintColor={COLORS.orange} />}
      >
        <View style={styles.headerSection}>
          <View style={{ height: 4, width: 40, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 12 }} />
          <Text style={[styles.kicker, { letterSpacing: 4 }]}>DATABASE</Text>
          <Text style={styles.heroTitle}>Attendance Records</Text>
        </View>

        <View style={{ marginTop: 25 }}>
          {busy && records.length === 0 ? (
            <ActivityIndicator color={COLORS.navy} size="large" style={{ marginTop: 40 }} />
          ) : records.length > 0 ? (
            records.map((r) => <AttendanceCard key={r.id} item={r} />)
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 50, color: '#94A3B8' }}>No records found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}