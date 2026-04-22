import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, SafeAreaView, Text, View, ScrollView, Animated } from "react-native";
import { getStudentMe } from "../../api/auth";
import { session } from "../../session";
import { PrimaryButton } from "../../components/PrimaryButton";
import styles, { COLORS } from "../../styles/styles";

export function StudentProfileScreen({ navigation }) {
  const [busy, setBusy] = useState(true);
  const [profile, setProfile] = useState(null);
  const zoomAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const data = await getStudentMe(session?.user?.email);
        setProfile(data);
        Animated.parallel([
          Animated.spring(zoomAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true })
        ]).start();
      } catch (e) { console.error(e); } 
      finally { setBusy(false); }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <View style={{ position: 'absolute', width: 500, height: 500, borderRadius: 250, backgroundColor: COLORS.navy, top: -150, left: -100, opacity: 0.04 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, maxWidth: 650, alignSelf: 'center', width: '100%' }}>
        <Text style={[styles.heroTitle, { textAlign: 'center', color: COLORS.navy, marginBottom: 30 }]}>My Identity</Text>
        {busy ? <ActivityIndicator size="large" color={COLORS.navy} /> : profile && (
          <Animated.View style={{ backgroundColor: 'rgba(255,255,255,0.92)', padding: 40, borderRadius: 40, alignItems: 'center', elevation: 20, opacity: fadeAnim, transform: [{ scale: zoomAnim }] }}>
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.navy, marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 36, fontWeight: '900' }}>{profile.first_name[0]}</Text>
            </View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: COLORS.navy }}>{profile.first_name} {profile.last_name}</Text>
            <Text style={{ color: COLORS.orange, fontWeight: '800', marginTop: 5 }}>{profile.student_no}</Text>
            <View style={{ width: '100%', marginTop: 30 }}>
                <ProfileRow label="COURSE" value={profile.course} />
                <ProfileRow label="ACADEMIC YEAR" value={`Year ${profile.year_level}`} />
            </View>
          </Animated.View>
        )}
      </ScrollView>
      <View style={{ padding: 24, position: 'absolute', bottom: 0, width: '100%', alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 400 }}><PrimaryButton title="Close Profile" onPress={() => navigation.goBack()} /></View>
      </View>
    </SafeAreaView>
  );
}

const ProfileRow = ({ label, value }) => (
    <View style={{ marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 }}>
        <Text style={{ color: COLORS.muted, fontSize: 10, fontWeight: '900' }}>{label}</Text>
        <Text style={{ color: COLORS.navy, fontWeight: '700', fontSize: 16 }}>{value}</Text>
    </View>
);