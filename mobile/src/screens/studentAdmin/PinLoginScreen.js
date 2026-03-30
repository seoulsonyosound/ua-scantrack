import React, { useState } from "react";
import { SafeAreaView, Text, TextInput, View } from "react-native";
import { validateEventPin } from "../../api/events";
import { PrimaryButton } from "../../components/PrimaryButton";
import { logout } from "../../utils/logout";

export function PinLoginScreen({ navigation }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [pinError, setPinError] = useState("");

  async function onContinue() {
    const trimmed = pin.trim();

    if (trimmed.length !== 4) {
      setPinError("PIN must be exactly 4 digits.");
      return;
    }

    setBusy(true);
    setPinError("");
    try {
      const event = await validateEventPin(trimmed);
      navigation.replace("Scanner", { pin: trimmed, event });
    } catch (e) {
      setPinError(e?.response?.data?.detail ?? "Invalid PIN.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Enter Event PIN</Text>

      <View style={{ gap: 6 }}>
        <Text style={{ color: "#374151" }}>4-digit PIN</Text>
        <TextInput
          value={pin}
          onChangeText={(v) => {
            setPin(v.replace(/[^0-9]/g, ""));
            if (pinError) setPinError("");
          }}
          placeholder="e.g., 8821"
          keyboardType="number-pad"
          maxLength={4}
          style={{
            borderWidth: 1,
            borderColor: pinError ? "#ef4444" : "#d1d5db",
            padding: 12,
            borderRadius: 10,
            fontSize: 16,
          }}
        />
        {pinError ? <Text style={{ color: "#ef4444" }}>{pinError}</Text> : null}
      </View>

      <PrimaryButton title={busy ? "Please wait..." : "Continue"} onPress={onContinue} disabled={busy} />


      <Text style={{ color: "#6b7280", marginTop: 8 }}>
        This access is temporary and locked to the selected event.
      </Text>
    </SafeAreaView>
  );
}