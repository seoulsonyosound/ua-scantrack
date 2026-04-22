import React, { useEffect, useState, useRef } from "react";
import { 
  Alert, SafeAreaView, Text, View, Pressable, 
  ScrollView, Animated, Easing, ActivityIndicator 
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { listEvents } from "../../api/events";
import { downloadReportCsv } from "../../api/reports";
import styles, { COLORS } from "../../styles/styles";

export function AdminReportsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const shapeRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Kinetic Background Animation
    Animated.loop(
      Animated.timing(shapeRotation, {
        toValue: 1, duration: 40000, easing: Easing.linear, useNativeDriver: true
      })
    ).start();

    (async () => {
      try {
        const data = await listEvents();
        setEvents(data);
      } catch (e) {
        Alert.alert("Failed", "Could not load events.");
      }
    })();
  }, []);

  const spin = shapeRotation.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '360deg']
  });

  async function shareCsv({ csvText, filename }) {
    const uri = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(uri, csvText);

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert("Saved", `CSV saved to:\n${uri}`);
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: "text/csv",
      dialogTitle: "Share CSV",
      UTI: "public.comma-separated-values-text",
    });
  }

  async function download(ev) {
    setBusyId(ev.id);
    try {
      const csvText = await downloadReportCsv(ev.id);
      await shareCsv({ 
        csvText, 
        filename: `attendance_${ev.title.replace(/\s+/g, '_')}_${ev.event_date}.csv` 
      });
    } catch (e) {
      Alert.alert("Failed", "Connection error. Check server status.");
    } finally {
      setBusyId(null);
    }
  }

  // Report Card Component with the requested style
  const ReportCard = ({ title, description, onExport, index, isBusy }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, delay: index * 100, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, friction: 8, delay: index * 100, useNativeDriver: true })
      ]).start();
    }, []);

    return (
      <Animated.View style={{ opacity, transform: [{ scale }, { translateY }], marginBottom: 16 }}>
        <Pressable 
          disabled={isBusy}
          onPress={onExport}
          style={({ pressed }) => [
            { 
              backgroundColor: 'white', padding: 24, borderRadius: 28, 
              borderWidth: 1, borderColor: '#F1F5F9', elevation: 4,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
            },
            pressed && { transform: [{ scale: 0.98 }], backgroundColor: '#FAFBFC' }
          ]}
        >
          <View style={{ flex: 1, paddingRight: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.navy }}>{title}</Text>
            <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '600', marginTop: 4 }}>{description}</Text>
          </View>

          <View style={{ 
            backgroundColor: isBusy ? "#9ca3af" : COLORS.navy, 
            paddingHorizontal: 16, 
            paddingVertical: 10, 
            borderRadius: 14 
          }}>
            {isBusy ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 11 }}>EXPORT</Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      {/* KINETIC BACKGROUND */}
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{ 
          position: 'absolute', width: 700, height: 700, borderRadius: 350, 
          backgroundColor: COLORS.navy, bottom: -250, right: -250, 
          transform: [{ rotate: spin }], opacity: 0.02 
        }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <View style={styles.headerSection}>
          <View style={{ height: 4, width: 40, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 12 }} />
          <Text style={[styles.kicker, { letterSpacing: 4 }]}>ANALYTICS</Text>
          <Text style={styles.heroTitle}>Data Reports</Text>
        </View>

        <View style={{ marginTop: 30 }}>
          {events.map((ev, index) => (
            <ReportCard 
              key={ev.id}
              index={index}
              title={ev.title} 
              description={`Full logs for ${ev.venue}`}
              onExport={() => download(ev)}
              isBusy={busyId === ev.id}
            />
          ))}
          {events.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>No events found.</Text>
          )}
        </View>
      </ScrollView>

      {/* FLOATING BACK BUTTON - Matches "ua-scantrack" UI */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: 'rgba(248, 250, 252, 0.8)', // Glassmorphism effect
      }}>
        
       
      </View>
    </SafeAreaView>
  );
}