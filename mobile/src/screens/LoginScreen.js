import React, { useState } from "react";
import { SafeAreaView, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { login } from "../api/auth";
import { session } from "../session";

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("student@ua.edu");
  const [password, setPassword] = useState("student123");
  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  async function onLogin() {
    setBusy(true);
    setLoginError("");
    try {
      const user = await login(email.trim(), password);
      session.user = user;

      if (user.role === "ADMIN") {
        navigation.reset({ index: 0, routes: [{ name: "AdminHome" }] });
      } else {
        // keep your existing behavior; no StudentHome changes here
        navigation.reset({ index: 0, routes: [{ name: "StudentHome" }] });
      }
    } catch (e) {
      setLoginError(e?.response?.data?.detail ?? "Invalid credentials.");
    } finally {
      setBusy(false);
    }
  }

  const inputBorder = loginError ? "#ef4444" : "#d1d5db";

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "900" }}>Login (Demo)</Text>

      <View style={{ gap: 6 }}>
        <Text>Email</Text>
        <TextInput
          autoCapitalize="none"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (loginError) setLoginError("");
          }}
          style={{ borderWidth: 1, borderColor: inputBorder, padding: 12, borderRadius: 10 }}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text>Password</Text>
        <TextInput
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (loginError) setLoginError("");
          }}
          secureTextEntry
          style={{ borderWidth: 1, borderColor: inputBorder, padding: 12, borderRadius: 10 }}
        />
      </View>

      {loginError ? <Text style={{ color: "#ef4444" }}>{loginError}</Text> : null}

      <PrimaryButton title={busy ? "Signing in..." : "Login"} onPress={onLogin} disabled={busy} />

      <PrimaryButton
        title="Student Admin (Scan via PIN)"
        onPress={() => navigation.navigate("PinLogin")}
        disabled={busy}
      />
    </SafeAreaView>
  );
}