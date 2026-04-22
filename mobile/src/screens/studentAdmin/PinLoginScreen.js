import React, { useState, useRef, useEffect } from "react";
import { 
  SafeAreaView, Text, TextInput, View, Animated, Easing, 
  Dimensions, ActivityIndicator, Pressable 
} from "react-native";
import { validateEventPin } from "../../api/events";
import { PrimaryButton } from "../../components/PrimaryButton";
import styles, { COLORS } from "../../styles/styles";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function PinLoginScreen({ navigation, route }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [pinError, setPinError] = useState("");

  const shapeRotation = useRef(new Animated.Value(0)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.timing(shapeRotation, { toValue: 1, duration: 25000, easing: Easing.linear, useNativeDriver: true })
      ),
      Animated.spring(entryAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
    ]).start();
  }, []);

  const spin = shapeRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const expectedPin = route?.params?.expectedPin;
  const targetEvent = route?.params?.event;

  async function onContinue() {
    const trimmed = pin.trim();
    if (trimmed.length !== 4) { setPinError("PIN must be 4 digits."); return; }
    setBusy(true);
    try {
      if (expectedPin) {
        if (trimmed === expectedPin) navigation.replace("Scanner", { pin: trimmed, event: targetEvent });
        else setPinError("Incorrect PIN.");
      } else {
        const event = await validateEventPin(trimmed);
        navigation.replace("Scanner", { pin: trimmed, event });
      }
    } catch (e) { setPinError("Invalid PIN."); } finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* BACKGROUND SHAPES */}
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: COLORS.navy, top: -100, left: -100, transform: [{ rotate: spin }], opacity: 0.05 }} />
      </View>

      <Animated.View style={{ flex: 1, justifyContent: 'center', padding: 24, opacity: entryAnim, transform: [{ scale: entryAnim }] }}>
        <View style={{ backgroundColor: 'white', padding: 30, borderRadius: 30, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, maxWidth: 450, alignSelf: 'center', width: '100%' }}>
          <Text style={styles.kicker}>SECURITY CHECK</Text>
          <Text style={{ fontSize: 24, fontWeight: "900", color: COLORS.navy, marginBottom: 20 }}>
            {targetEvent ? targetEvent.title : "Access Event"}
          </Text>

          <TextInput
            value={pin}
            onChangeText={(v) => setPin(v.replace(/[^0-9]/g, ""))}
            placeholder="0000"
            keyboardType="number-pad"
            maxLength={4}
            style={{
              backgroundColor: '#F1F5F9', padding: 20, borderRadius: 15, fontSize: 32, textAlign: 'center', 
              letterSpacing: 15, fontWeight: '900', color: COLORS.navy, marginBottom: 10,
              borderWidth: 2, borderColor: pinError ? '#ef4444' : 'transparent'
            }}
          />
          {!!pinError && <Text style={{ color: "#ef4444", textAlign: 'center', marginBottom: 10 }}>{pinError}</Text>}

          <PrimaryButton title={busy ? "Verifying..." : "Open Scanner"} onPress={onContinue} disabled={busy} />
          {!expectedPin && <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 15 }}><Text style={{ textAlign: 'center', color: COLORS.muted }}>Cancel</Text></Pressable>}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}