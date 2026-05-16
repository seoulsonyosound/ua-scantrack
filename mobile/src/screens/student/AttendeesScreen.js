import React, { useEffect, useMemo, useState, useRef } from "react";
import { 
  ActivityIndicator, SafeAreaView, Text, View, ScrollView, 
  Animated, Easing, Dimensions, Pressable 
} from "react-native";
import { listAttendance } from "../../api/attendance";
import { PrimaryButton } from "../../components/PrimaryButton";
import styles, { COLORS } from "../../styles/styles";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function AttendeesScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [busy, setBusy] = useState(true);
  const [records, setRecords] = useState([]);

  // Animation Refs
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
        const data = await listAttendance();
        setRecords(data);
      } catch (error) {
        console.error("Attendance fetch error:", error);
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  // Filter records to only show attendees for the selected event
  const attendees = useMemo(() => {
    return records
      .filter((r) => {
        const recordEventId = r.event?.id || r.event;
        return String(recordEventId) === String(eventId);
      })
      .map((r) => r.student);
  }, [records, eventId]);

  const spin = shapeRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const isLargeScreen = SCREEN_WIDTH > 768;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Animated.View style={{ 
          position: 'absolute', width: 450, height: 450, borderRadius: 225, 
          backgroundColor: COLORS.navy, top: -150, right: -100, 
          transform: [{ rotate: spin }], opacity: 0.04 
        }} />
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={{ paddingHorizontal: isLargeScreen ? 60 : 24, paddingTop: 40, maxWidth: 900, alignSelf: 'center', width: '100%' }}>
          <View style={{ height: 4, width: 30, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 10 }} />
          <Text style={styles.kicker}>{attendees.length} RECORDED ENTRIES</Text>
          <Text style={[styles.heroTitle, { fontSize: isLargeScreen ? 42 : 32, color: COLORS.navy }]}>Attendance List</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: isLargeScreen ? 60 : 20, paddingTop: 20, paddingBottom: 150, maxWidth: 900, alignSelf: 'center', width: '100%' }}>
          {busy ? (
            <ActivityIndicator color={COLORS.navy} size="large" style={{ marginTop: 50 }} />
          ) : attendees.length === 0 ? (
            <View style={{ marginTop: 60, alignItems: 'center' }}>
                <Text style={{ color: COLORS.muted, fontSize: 16 }}>No attendees found for this event.</Text>
            </View>
          ) : (
            attendees.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))
          )}
        </ScrollView>
      </Animated.View>

      <View style={{ padding: 24, position: 'absolute', bottom: 0, width: '100%', alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 400 }}>
          <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const StudentCard = ({ student }) => {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scale }], marginBottom: 12 }}>
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 1.02, friction: 4, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
        style={{ 
          backgroundColor: 'white', borderRadius: 20, padding: 20,
          flexDirection: 'row', alignItems: 'center', elevation: 4,
          borderLeftWidth: 6, borderLeftColor: COLORS.orange
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: "900", color: COLORS.navy }}>{student.last_name}, {student.first_name}</Text>
          <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: "700" }}>{student.student_no} • {student.course}</Text>
        </View>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' }} />
      </Pressable>
    </Animated.View>
  );
};