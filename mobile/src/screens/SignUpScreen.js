import React, { useState, useRef, useEffect } from "react";
import { 
  SafeAreaView, Text, TextInput, View, KeyboardAvoidingView, 
  Platform, Pressable, Animated, Easing, Alert, ActivityIndicator, 
  ScrollView, Modal 
} from "react-native";
import { register } from "../api/auth"; 
import styles, { COLORS } from "../styles/styles";

export function SignUpScreen({ navigation, route }) {
  const [form, setForm] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    email: route.params?.initialEmail || "",
    password: "",
    confirm_password: ""
  });
  const [busy, setBusy] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shapeRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.loop(
        Animated.timing(shapeRotation, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true })
      )
    ]).start();
  }, []);

  const spin = shapeRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const onRegister = async () => {
    const { student_id, email, password, first_name, last_name, confirm_password } = form;

   
    if (!student_id.trim() || !first_name.trim() || !last_name.trim() || !email.trim() || !password) {
      Alert.alert("Missing Fields", "Please fill in all information, including your Student ID.");
      return;
    }

    if (password !== confirm_password) {
      Alert.alert("Password Mismatch", "Passwords do not match. Please re-enter.");
      return;
    }

    setBusy(true);
    try {
     
      await register({
        student_no: student_id.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        password: password,
        first_name: first_name.trim(),
        last_name: last_name.trim()
      });

      setShowSuccessModal(true);
    } catch (e) {
      const errorDetail = e.response?.data;
      console.log("Signup Error Details:", errorDetail);
      
      let msg = "We couldn't create your account. Please check your network.";
      if (errorDetail?.email) msg = "This email is already in use.";
      if (errorDetail?.student_no) msg = "This Student ID is already registered.";
      
      Alert.alert("Registration Failed", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      {/* LATEST UPDATE: Success Notification Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', padding: 30, borderRadius: 25, alignItems: 'center' }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#4BB543', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
               <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>✓</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.navy, marginBottom: 10 }}>Account Created!</Text>
            <Text style={{ color: COLORS.muted, textAlign: 'center', marginBottom: 25, lineHeight: 20 }}>
              Welcome to UA ScanTrack, {form.first_name}. Your account has been successfully registered.
            </Text>
            <Pressable 
              onPress={() => { setShowSuccessModal(false); navigation.navigate("Login"); }}
              style={{ backgroundColor: COLORS.navy, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 15 }}
            >
              <Text style={{ color: 'white', fontWeight: '800' }}>CONTINUE TO LOGIN</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{ 
          position: 'absolute', width: 600, height: 600, borderRadius: 300, 
          backgroundColor: COLORS.navy, bottom: -200, right: -200, 
          transform: [{ rotate: spin }], opacity: 0.05 
        }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 30 }}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={{ marginBottom: 25 }}>
               <View style={{ height: 4, width: 30, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 10 }} />
               <Text style={[styles.heroTitle, { fontSize: 40, color: COLORS.navy }]}>Join UA{"\n"}ScanTrack</Text>
               <Text style={{ color: COLORS.muted, fontWeight: '900', fontSize: 11, marginTop: 10, letterSpacing: 2 }}>STUDENT ENROLLMENT</Text>
            </View>

            <View style={{ width: '100%' }}>
              <StyledInput 
                label="STUDENT ID" 
                value={form.student_id} 
                onChange={(v) => setForm({...form, student_id: v})} 
                placeholder="e.g., 2021000022" 
              />
              <StyledInput 
                label="FIRST NAME" 
                value={form.first_name} 
                onChange={(v) => setForm({...form, first_name: v})} 
                placeholder="First Name" 
              />
              <StyledInput 
                label="LAST NAME" 
                value={form.last_name} 
                onChange={(v) => setForm({...form, last_name: v})} 
                placeholder="Last Name" 
              />
              <StyledInput 
                label="UA EMAIL" 
                value={form.email} 
                onChange={(v) => setForm({...form, email: v})} 
                placeholder="name.student@ua.edu.ph" 
              />
              <StyledInput 
                label="PASSWORD" 
                value={form.password} 
                onChange={(v) => setForm({...form, password: v})} 
                secure={true} 
                placeholder="••••••••" 
              />
              <StyledInput 
                label="CONFIRM PASSWORD" 
                value={form.confirm_password} 
                onChange={(v) => setForm({...form, confirm_password: v})} 
                secure={true} 
                placeholder="••••••••" 
              />

              <Pressable 
                onPress={onRegister} 
                disabled={busy} 
                style={({ pressed }) => [
                  { backgroundColor: COLORS.navy, padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 10, elevation: 4 },
                  pressed && { opacity: 0.8 }
                ]}
              >
                {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900', letterSpacing: 1.5 }}>CREATE ACCOUNT</Text>}
              </Pressable>

              <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 25, alignItems: 'center' }}>
                <Text style={{ color: COLORS.muted, fontWeight: '700' }}>Already have an account? <Text style={{ color: COLORS.navy }}>Login</Text></Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const StyledInput = ({ label, value, onChange, secure = false, placeholder }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ color: COLORS.navy, fontWeight: '900', fontSize: 9, letterSpacing: 1.5, marginBottom: 6 }}>{label}</Text>
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChange} 
      secureTextEntry={secure}
      autoCapitalize="none"
      style={{ backgroundColor: 'white', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#F1F5F9', color: COLORS.navy, fontWeight: '600' }}
    />
  </View>
);