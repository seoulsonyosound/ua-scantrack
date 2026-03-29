import React, { useState } from "react";
import { Alert, SafeAreaView, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { login } from "../api/auth";
import { session } from "../session";

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("student@ua.edu");
  const [password, setPassword] = useState("student123");
  const [busy, setBusy] = useState(false);

  async function onLogin() {
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      session.user = user;

      if (user.role === "ADMIN") {
        navigation.reset({ index: 0, routes: [{ name: "AdminHome" }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "StudentHome" }] });
      }
    } catch (e) {
      Alert.alert("Login failed", e?.response?.data?.detail ?? "Invalid credentials.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "900" }}>Login (Demo)</Text>

      <View style={{ gap: 6 }}>
        <Text>Email</Text>
        <TextInput
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={{ borderWidth: 1, borderColor: "#d1d5db", padding: 12, borderRadius: 10 }}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ borderWidth: 1, borderColor: "#d1d5db", padding: 12, borderRadius: 10 }}
        />
      </View>

      <PrimaryButton
        title={busy ? "Signing in..." : "Login"}
        onPress={onLogin}
        disabled={busy}
      />

      <PrimaryButton
        title="Student Admin (Scan via PIN)"
        onPress={() => navigation.navigate("PinLogin")}
        disabled={busy}
      />

      <Text style={{ color: "#6b7280" }}>
        Seed demo accounts:
        {"\n"}- admin@ua.edu / admin123
        {"\n"}- student@ua.edu / student123
      </Text>
    </SafeAreaView>
  );
}