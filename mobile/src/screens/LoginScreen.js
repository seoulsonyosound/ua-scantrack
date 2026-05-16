import React, { useState, useRef, useEffect } from "react";
import { 
  SafeAreaView, Text, TextInput, View, KeyboardAvoidingView, 
  Platform, Pressable, Animated, Easing, Alert 
} from "react-native";
import { login } from "../api/auth";
import { session } from "../session";
import styles, { COLORS } from "../styles/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("student@ua.edu");
  const [password, setPassword] = useState("student123");
  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shapeRotation = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.loop(
        Animated.timing(shapeRotation, { toValue: 1, duration: 25000, easing: Easing.linear, useNativeDriver: true })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
        ])
      )
    ]).start();
  }, []);

  const handleSignUp = () => {
    navigation.navigate("SignUp", { initialEmail: email.endsWith('@ua.edu.ph') ? email : "" });
  };

  const spin = shapeRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const float = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30]
  });

 async function onLogin() {
  setBusy(true);
  setLoginError("");
  try {
    const response = await login(email.trim(), password);
    session.token = response.token; 
    session.user = {
      email: response.email,
      role: response.role,
      student_id: response.student_id
    };

    if (response.token) {
      await AsyncStorage.setItem('userToken', response.token);
    }

    navigation.reset({ 
      index: 0, 
      routes: [{ name: response.role === "ADMIN" ? "AdminHome" : "StudentHome" }] 
    });

  } catch (e) {
    const errorMsg = e?.response?.data?.detail || "Invalid email or password.";
    setLoginError(errorMsg);
    session.token = null;
    await AsyncStorage.removeItem('userToken');
  } finally {
    setBusy(false);
  }
}

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{ position: 'absolute', width: 500, height: 500, borderRadius: 250, backgroundColor: COLORS.navy, top: -100, right: -100, transform: [{ rotate: spin }], opacity: 0.12 }} />
        <Animated.View style={{ position: 'absolute', width: 300, height: 300, borderRadius: 60, backgroundColor: COLORS.orange, bottom: -50, left: -80, transform: [{ rotate: spin }, { translateY: float }], opacity: 0.18 }} />
        <Animated.View style={{ position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 15, borderColor: COLORS.navy, top: '40%', left: -50, transform: [{ translateY: float }], opacity: 0.08 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, opacity: fadeAnim }}>
          
          <View style={{ marginBottom: 50, alignItems: 'center' }}>
             <View style={{ height: 6, width: 40, backgroundColor: COLORS.orange, borderRadius: 3, marginBottom: 15 }} />
             <Text style={[styles.kicker, { color: COLORS.navy, letterSpacing: 6, fontSize: 13, fontWeight: '900', opacity: 0.8 }]}>UA SCANTRACK</Text>
             <Text style={[styles.heroTitle, { fontSize: 64, lineHeight: 70, fontWeight: '900', color: COLORS.navy, textAlign: 'center' }]}>Welcome{"\n"}Back</Text>
          </View>

          <View style={{ width: '100%', maxWidth: 420 }}>
            <StyledInput label="UNIVERSITY EMAIL" value={email} onChange={(v) => { setEmail(v); setLoginError(""); }} placeholder="user@ua.edu.ph" />
            <StyledInput label="PASSWORD" value={password} onChange={(v) => { setPassword(v); setLoginError(""); }} secure={true} placeholder="••••••••" />

            {loginError ? <Text style={{ color: "#ef4444", fontWeight: '800', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>{loginError}</Text> : null}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
              <HoverButton 
                title={busy ? "..." : "LOGIN"} 
                onPress={onLogin} 
                isPrimary={true} 
                flex={1.4} 
                disabled={busy} 
              />
              <HoverButton 
                title="STUDENT ADMIN" 
                onPress={() => navigation.navigate("PinLogin")} 
                isPrimary={false} 
                flex={1.6} 
              />
            </View>

            {/* NEW SIGN UP OPTION */}
            <Pressable 
              onPress={handleSignUp}
              style={({ pressed }) => [
                { marginTop: 25, alignItems: 'center' },
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              hitSlop={15}
            >
              <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 14 }}>
                New student? <Text style={{ color: COLORS.orange }}>Sign Up with GSuite</Text>
              </Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 80 }}>
             <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 11, fontWeight: '900', letterSpacing: 5 }}>UNIVERSITY OF THE ASSUMPTION</Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const StyledInput = ({ label, value, onChange, secure = false, placeholder, loginError }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={{ width: '100%', marginBottom: 18, zIndex: 100 }}>
      <Text style={{ color: COLORS.navy, fontWeight: '900', fontSize: 10, letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>{label}</Text>
      <View style={{ 
        borderRadius: 20, 
        backgroundColor: 'white', 
        borderWidth: 2,
        borderColor: isFocused ? COLORS.navy : (loginError ? '#ef4444' : '#F1F5F9'),
      }}>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChange} 
          secureTextEntry={secure}
          textAlign="center"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          style={{ 
            padding: 22, 
            borderRadius: 20, 
            fontSize: 16, 
            color: COLORS.navy, 
            fontWeight: '600',
            ...Platform.select({ web: { outlineStyle: 'none', cursor: 'text' } })
          }}
        />
      </View>
    </View>
  );
};

const HoverButton = ({ onPress, title, isPrimary, flex, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handleHover = (isHovering) => {
    if (Platform.OS !== 'web') return;
    Animated.spring(scale, { toValue: isHovering ? 1.02 : 1, friction: 8, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ flex, transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        style={({ pressed }) => [
          { paddingVertical: 22, paddingHorizontal: 10, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
          isPrimary ? { backgroundColor: pressed ? '#1e293b' : COLORS.navy, elevation: 8 } : { backgroundColor: pressed ? '#f8fafc' : 'white', borderWidth: 2, borderColor: '#E2E8F0' }
        ]}
      >
        <Text numberOfLines={1} style={{ color: isPrimary ? 'white' : COLORS.navy, fontWeight: '900', fontSize: 14, letterSpacing: 1, textAlign: 'center' }}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};