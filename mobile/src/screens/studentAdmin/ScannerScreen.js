import React, { useState, useEffect, useRef } from "react";
import { Text, View, ActivityIndicator, StyleSheet, Pressable, Animated, Easing } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { scanCheckin } from "../../api/attendance";
import { COLORS } from "../../styles/styles";

export function ScannerScreen({ route, navigation }) {
  const { pin, event } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [stats, setStats] = useState({ present: 0, late: 0 });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();
  }, []);

  async function handleScanned({ data }) {
    if (busy || !data) return;
    setBusy(true);
    let cleanID = String(data).replace(/\D/g, ""); 
    try {
      const record = await scanCheckin({ pin_code: pin, student_no: cleanID });
      setStatusMsg({ text: `Success: ${record.student?.first_name}`, type: "success" });
      setStats(prev => ({ 
        ...prev, 
        present: record.status === "PRESENT" ? prev.present + 1 : prev.present,
        late: record.status === "LATE" ? prev.late + 1 : prev.late
      }));
      setTimeout(() => setBusy(false), 2000);
    } catch (e) {
      setStatusMsg({ text: "Failed", type: "error" });
      setTimeout(() => setBusy(false), 2000);
    }
  }

  return (
    <View style={ui.container}>
      <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={busy ? undefined : handleScanned} />
      
      {/* GLASS HEADER */}
      <View style={ui.header}>
        <View style={{ height: 3, width: 20, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 5 }} />
        <Text style={ui.kicker}>SCANNING LIVE</Text>
        <Text style={ui.eventTitle}>{event?.title}</Text>
      </View>

      <View style={ui.overlayContainer}>
        <Animated.View style={[ui.reticle, { transform: [{ scale: pulseAnim }] }]}>
          <View style={ui.cornerTL}/><View style={ui.cornerTR}/><View style={ui.cornerBL}/><View style={ui.cornerBR}/>
          {busy && <ActivityIndicator size="large" color={COLORS.orange} />}
        </Animated.View>
      </View>

      <View style={ui.footer}>
        <View style={ui.statsRow}>
          <View><Text style={ui.statLabel}>PRESENT</Text><Text style={ui.statValue}>{stats.present}</Text></View>
          <View style={{ alignItems: 'flex-end' }}><Text style={[ui.statLabel, { color: COLORS.orange }]}>LATE</Text><Text style={[ui.statValue, { color: COLORS.orange }]}>{stats.late}</Text></View>
        </View>
        <Pressable onPress={() => navigation.navigate("Summary", { event, stats })} style={ui.closeBtn}>
          <Text style={ui.closeBtnText}>FINISH SESSION</Text>
        </Pressable>
      </View>
    </View>
  );
}

const ui = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { position: 'absolute', top: 50, width: '90%', alignSelf: 'center', backgroundColor: 'rgba(6, 20, 59, 0.85)', padding: 20, borderRadius: 25 },
  kicker: { color: COLORS.orange, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  eventTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  overlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  reticle: { width: 250, height: 250, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  cornerTL: { position: 'absolute', top: -2, left: -2, width: 40, height: 40, borderLeftWidth: 5, borderTopWidth: 5, borderColor: COLORS.orange, borderTopLeftRadius: 15 },
  cornerTR: { position: 'absolute', top: -2, right: -2, width: 40, height: 40, borderRightWidth: 5, borderTopWidth: 5, borderColor: COLORS.orange, borderTopRightRadius: 15 },
  cornerBL: { position: 'absolute', bottom: -2, left: -2, width: 40, height: 40, borderLeftWidth: 5, borderBottomWidth: 5, borderColor: COLORS.orange, borderBottomLeftRadius: 15 },
  cornerBR: { position: 'absolute', bottom: -2, right: -2, width: 40, height: 40, borderRightWidth: 5, borderBottomWidth: 5, borderColor: COLORS.orange, borderBottomRightRadius: 15 },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statLabel: { color: '#64748b', fontSize: 12, fontWeight: '900' },
  statValue: { fontSize: 38, fontWeight: '900', color: COLORS.navy },
  closeBtn: { backgroundColor: COLORS.navy, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#fff', fontWeight: '800', letterSpacing: 1 }
});