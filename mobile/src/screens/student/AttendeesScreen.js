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

  // Animation Refs for Background Shapes
  const shapeRotation = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start Background & Entrance Animations
    Animated.parallel([
      Animated.loop(
        Animated.timing(shapeRotation, { toValue: 1, duration: 25000, easing: Easing.linear, useNativeDriver: true })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
        ])
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

  
  const attendees = useMemo(() => {
    return records
      .filter((r) => {
       
        const recordEventId = r.event?.id || r.event;
        return String(recordEventId) === String(eventId);
      })
      .map((r) => r.student);
  }, [records, eventId]);

  const spin = shapeRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const float = bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const isLargeScreen = SCREEN_WIDTH > 768;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      
      
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <Animated.View style={{ 
          position: 'absolute', width: 450, height: 450, borderRadius: 225, 
          backgroundColor: COLORS.navy, top: -150, right: -100, 
          transform: [{ rotate: spin }], opacity: 0.04 
        }} />
        <Animated.View style={{ 
          position: 'absolute', width: 200, height: 200, borderRadius: 40, 
          backgroundColor: COLORS.orange, bottom: 100, left: -40, 
          transform: [{ rotate: spin }, { translateY: float }], opacity: 0.07 
        }} />
      </View>

      <Animated.View style={{ flex: 1, zIndex: 1, opacity: fadeAnim }}>
        <View style={{ 
          paddingHorizontal: isLargeScreen ? 60 : 24, 
          paddingTop: 40, 
          maxWidth: 900, 
          alignSelf: 'center', 
          width: '100%' 
        }}>
          <View style={{ height: 4, width: 30, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 10 }} />
          <Text style={styles.kicker}>{attendees.length} RECORDED ENTRIES</Text>
          <Text style={[styles.heroTitle, { fontSize: isLargeScreen ? 42 : 32, color: COLORS.navy }]}>Attendance List</Text>
        </View>

        <ScrollView 
          style={{ flex: 1, backgroundColor: 'transparent' }}
          contentContainerStyle={{ 
            paddingHorizontal: isLargeScreen ? 60 : 20, 
            paddingTop: 20,
            paddingBottom: 150, 
            maxWidth: 900, 
            alignSelf: 'center', 
            width: '100%' 
          }}
          showsVerticalScrollIndicator={false}
        >
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

      
      <View style={{ 
        padding: 24, 
        backgroundColor: 'transparent', 
        position: 'absolute', 
        bottom: 0, 
        width: '100%', 
        alignItems: 'center',
        zIndex: 2
      }}>
        <View style={{ width: '100%', maxWidth: 400 }}>
          <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </SafeAreaView>
  );
}


const StudentCard = ({ student }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 1.02, friction: 4, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 12 }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: 20,
          flexDirection: 'row', 
          alignItems: 'center',
          overflow: 'hidden',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          borderLeftWidth: 6,
          borderLeftColor: COLORS.orange
        }}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 17, fontWeight: "900", color: COLORS.navy }}>
            {student.last_name}, {student.first_name}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 4, alignItems: 'center' }}>
            <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: "700" }}>
              {student.student_no}
            </Text>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 }} />
            <Text style={{ color: COLORS.orange, fontSize: 12, fontWeight: "800" }}>
              {student.course} • Year {student.year_level}
            </Text>
          </View>
        </View>
        
        <View style={{ paddingRight: 20 }}>
           <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' }} />
        </View>
      </Pressable>
    </Animated.View>
  );
};