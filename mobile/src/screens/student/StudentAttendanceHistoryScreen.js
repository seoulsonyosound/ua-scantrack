import React, { useRef, useEffect } from "react";
import { SafeAreaView, Text, View, Animated, ScrollView, Dimensions, Pressable } from "react-native";
import styles, { COLORS } from "../../styles/styles";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function StudentAttendanceHistoryScreen({ navigation, records = [] }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* TOP HEADER SECTION */}
      <View style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <View style={{ height: 4, width: 30, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 10 }} />
          <Text style={styles.kicker}>PERSONAL RECORDS</Text>
          <Text style={[styles.heroTitle, { fontSize: 36, color: COLORS.navy }]}>My History</Text>
        </View>
        <Pressable 
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Back to Dashboard</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
        {records.length === 0 ? (
          <Animated.View style={{ 
            flex: 1, justifyContent: 'center', alignItems: 'center', opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }], marginTop: 60 
          }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
               <Text style={{ fontSize: 30 }}>📁</Text>
            </View>
            <Text style={{ color: COLORS.navy, fontWeight: '800', fontSize: 18 }}>No attendance records found yet.</Text>
            <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 8, maxWidth: 250 }}>
              Once you scan into an event, your history will appear here.
            </Text>
          </Animated.View>
        ) : (
          records.map((item, index) => (
            <HistoryCard key={index} item={item} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const HistoryCard = ({ item }) => (
  <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 15, elevation: 3, borderLeftWidth: 5, borderLeftColor: COLORS.orange }}>
    <Text style={{ color: COLORS.navy, fontWeight: '900', fontSize: 16 }}>{item.event_title}</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
       <Text style={{ color: '#64748b', fontSize: 13 }}>{item.date}</Text>
       <Text style={{ color: COLORS.orange, fontWeight: '800', fontSize: 13 }}>{item.status}</Text>
    </View>
  </View>
);