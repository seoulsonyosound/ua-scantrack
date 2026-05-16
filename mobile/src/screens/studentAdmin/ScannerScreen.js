import React, { useState, useEffect, useRef } from "react";
import { 
  Text, View, ActivityIndicator, StyleSheet, Pressable, 
  Animated, Easing, TextInput, KeyboardAvoidingView, Platform, Vibration 
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { scanCheckin } from "../../api/attendance";
import { COLORS } from "../../styles/styles";

export function ScannerScreen({ route, navigation }) {
  const { pin, event } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  
  // States
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [stats, setStats] = useState({ present: 0, late: 0 });
  const [isManual, setIsManual] = useState(false);
  const [manualId, setManualId] = useState("");
  
  // Hardware States
  const [zoom, setZoom] = useState(0); 
  const [torch, setTorch] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: false })
      ])
    ).start();
  }, []);

  if (!permission?.granted) {
    return (
      <View style={ui.centered}>
        <Text style={{ color: '#fff', marginBottom: 20 }}>Camera access required</Text>
        <Pressable onPress={requestPermission} style={ui.closeBtn}>
          <Text style={ui.closeBtnText}>GRANT PERMISSION</Text>
        </Pressable>
      </View>
    );
  }

  async function processEntry(scannedData) {
    if (busy || !scannedData) return;
    
    // DEBUG: Look at your terminal to see what the camera is reading!
    console.log("BARCODE DETECTED:", scannedData);

    setBusy(true);
    setStatusMsg({ text: "VALIDATING...", type: "neutral" });

    try {
      const finalID = String(scannedData).trim();
      const record = await scanCheckin({ pin_code: pin, student_no: finalID });

      Vibration.vibrate(100); 
      setStatusMsg({ text: `SUCCESS: ${record.student?.first_name}`, type: "success" });
      setStats(prev => ({ 
        ...prev, 
        present: record.status === "PRESENT" ? prev.present + 1 : prev.present,
        late: record.status === "LATE" ? prev.late + 1 : prev.late
      }));

      setManualId("");
      setIsManual(false);
    } catch (e) {
      Vibration.vibrate([0, 100, 50, 100]);
      const errorDetail = e.response?.data?.detail || "NOT FOUND";
      setStatusMsg({ text: errorDetail.toUpperCase(), type: "error" });
    } finally {
      setTimeout(() => { 
        setBusy(false); 
        setStatusMsg({ text: "", type: "" }); 
      }, 2500);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={ui.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing="back"
        zoom={zoom}
        enableTorch={torch}
        barcodeScannerSettings={{
          // Added every major format to ensure it doesn't ignore your specific barcode
          barcodeTypes: ["qr", "code128", "code39", "pdf417", "ean13", "upc_a", "aztec", "datamatrix"],
        }}
        onBarcodeScanned={busy || isManual ? undefined : ({ data }) => processEntry(data)}
      />

      {/* TOP CONTROLS WITH ZOOM & TORCH */}
      <View style={ui.topControls}>
        <Pressable onPress={() => setTorch(!torch)} style={[ui.iconCircle, torch && {backgroundColor: COLORS.orange}]}>
          <Text style={{ fontSize: 20 }}>{torch ? "🔦" : "🌑"}</Text>
        </Pressable>
        
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={ui.kicker}>SCANNING LIVE</Text>
          <Text style={ui.eventTitle} numberOfLines={1}>{event?.title}</Text>
        </View>

        <Pressable onPress={() => setZoom(zoom === 0 ? 0.12 : 0)} style={[ui.iconCircle, zoom > 0 && {backgroundColor: COLORS.orange}]}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: zoom > 0 ? '#fff' : COLORS.navy }}>
            {zoom === 0 ? "1x" : "2x"}
          </Text>
        </Pressable>
      </View>

      {/* SCANNING RETICLE */}
      <View style={ui.overlayContainer}>
        {!isManual ? (
          <Animated.View style={[ui.reticle, { transform: [{ scale: pulseAnim }] }]}>
            <View style={ui.cornerTL}/><View style={ui.cornerTR}/><View style={ui.cornerBL}/><View style={ui.cornerBR}/>
            {busy ? <ActivityIndicator size="large" color={COLORS.orange} /> : <View style={ui.scanLine} />}
          </Animated.View>
        ) : (
          <View style={ui.manualCard}>
            <Text style={{ fontWeight: '900', color: COLORS.navy, marginBottom: 10 }}>MANUAL ID ENTRY</Text>
            <TextInput 
              style={ui.input} 
              placeholder="Enter ID..." 
              value={manualId} 
              onChangeText={setManualId}
              autoFocus 
            />
            <Pressable onPress={() => processEntry(manualId)} style={ui.closeBtn}>
              <Text style={ui.closeBtnText}>VALIDATE</Text>
            </Pressable>
            <Pressable onPress={() => setIsManual(false)} style={{ marginTop: 15 }}>
              <Text style={{ color: '#64748b', textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* VALIDATION TOAST */}
      {statusMsg.text !== "" && (
        <View style={[ui.statusPopup, 
          statusMsg.type === 'error' ? ui.bgRed : 
          statusMsg.type === 'success' ? ui.bgGreen : ui.bgNavy]}>
           <Text style={ui.statusText}>{statusMsg.text}</Text>
        </View>
      )}

      {/* FOOTER */}
      <View style={ui.footer}>
        <View style={ui.statsRow}>
          <View><Text style={ui.statLabel}>PRESENT</Text><Text style={ui.statValue}>{stats.present}</Text></View>
          <Pressable onPress={() => setIsManual(true)} style={ui.manualToggle}>
            <Text style={{ fontSize: 24 }}>⌨️</Text>
          </Pressable>
          <View style={{ alignItems: 'flex-end' }}><Text style={[ui.statLabel, { color: COLORS.orange }]}>LATE</Text><Text style={[ui.statValue, { color: COLORS.orange }]}>{stats.late}</Text></View>
        </View>
        <Pressable onPress={() => navigation.navigate("Summary", { event, stats })} style={ui.closeBtn}>
          <Text style={ui.closeBtnText}>FINISH SESSION</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const ui = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#06143B' },
  topControls: { position: 'absolute', top: 50, flexDirection: 'row', width: '92%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 24, alignItems: 'center', zIndex: 10 },
  iconCircle: { width: 48, height: 48, backgroundColor: '#F1F5F9', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  kicker: { color: COLORS.orange, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  eventTitle: { color: COLORS.navy, fontSize: 14, fontWeight: '900', textAlign: 'center' },
  overlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  reticle: { width: 280, height: 200, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  scanLine: { width: '80%', height: 2, backgroundColor: COLORS.orange, opacity: 0.5 },
  manualCard: { backgroundColor: 'white', padding: 25, borderRadius: 30, width: '85%' },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 15, marginBottom: 15, fontSize: 18, fontWeight: '800', color: COLORS.navy },
  statusPopup: { position: 'absolute', bottom: 180, alignSelf: 'center', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 30, elevation: 10 },
  statusText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  bgRed: { backgroundColor: '#ef4444' },
  bgGreen: { backgroundColor: '#10b981' },
  bgNavy: { backgroundColor: COLORS.navy },
  cornerTL: { position: 'absolute', top: -2, left: -2, width: 45, height: 45, borderLeftWidth: 6, borderTopWidth: 6, borderColor: COLORS.orange, borderTopLeftRadius: 18 },
  cornerTR: { position: 'absolute', top: -2, right: -2, width: 45, height: 45, borderRightWidth: 6, borderTopWidth: 6, borderColor: COLORS.orange, borderTopRightRadius: 18 },
  cornerBL: { position: 'absolute', bottom: -2, left: -2, width: 45, height: 45, borderLeftWidth: 6, borderBottomWidth: 6, borderColor: COLORS.orange, borderBottomLeftRadius: 18 },
  cornerBR: { position: 'absolute', bottom: -2, right: -2, width: 45, height: 45, borderRightWidth: 6, borderBottomWidth: 6, borderColor: COLORS.orange, borderBottomRightRadius: 18 },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statLabel: { color: '#64748b', fontSize: 12, fontWeight: '900' },
  statValue: { fontSize: 36, fontWeight: '900', color: COLORS.navy },
  manualToggle: { width: 55, height: 55, backgroundColor: '#F1F5F9', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  closeBtn: { backgroundColor: COLORS.navy, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', width: '100%' },
  closeBtnText: { color: '#fff', fontWeight: '900' }
});