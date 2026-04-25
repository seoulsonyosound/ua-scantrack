import React, { useRef, useEffect } from "react";
import { SafeAreaView, Text, View, Animated, Easing, Dimensions, Pressable } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import styles, { COLORS } from "../styles/styles";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function RoleSelectScreen({ navigation }) {
  const shapeRotation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.timing(shapeRotation, { toValue: 1, duration: 25000, easing: Easing.linear, useNativeDriver: true })
      ),
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ]).start();
  }, []);

  const spin = shapeRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
  
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{ 
          position: 'absolute', width: 500, height: 500, borderRadius: 250, 
          backgroundColor: COLORS.navy, top: -150, left: -150, 
          transform: [{ rotate: spin }], opacity: 0.05 
        }} />
        <Animated.View style={{ 
          position: 'absolute', width: 300, height: 300, borderRadius: 60, 
          backgroundColor: COLORS.orange, bottom: -50, right: -50, 
          transform: [{ rotate: spin }], opacity: 0.08 
        }} />
      </View>

      <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, opacity: fadeAnim }}>
        <View style={{ width: '100%', maxWidth: 450, backgroundColor: 'rgba(255,255,255,0.9)', padding: 40, borderRadius: 40, elevation: 20, shadowColor: COLORS.navy, shadowOpacity: 0.1, shadowRadius: 30 }}>
          <View style={{ height: 4, width: 30, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 15 }} />
          <Text style={[styles.kicker, { letterSpacing: 4 }]}>WELCOME TO</Text>
          <Text style={[styles.heroTitle, { fontSize: 32, color: COLORS.navy, marginBottom: 10 }]}>UA Scan & Track</Text>
          <Text style={{ color: "#64748b", marginBottom: 35, lineHeight: 22 }}>
            Select your portal to continue. Security and access levels will be applied based on your role.
          </Text>

          <View style={{ gap: 15 }}>
            <RoleTile title="Student Portal" subtitle="View history & events" onPress={() => navigation.navigate("StudentEvents")} color={COLORS.navy} />
            <RoleTile title="Administrator" subtitle="Manage system data" onPress={() => navigation.navigate("AdminHome")} color="#b91c1c" />
            <RoleTile title="Student Admin" subtitle="Event PIN Scanner" onPress={() => navigation.navigate("PinLogin")} color="#047857" />
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}


const RoleTile = ({ title, subtitle, onPress, color }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handleIn = () => Animated.spring(scale, { toValue: 1.03, friction: 4, useNativeDriver: true }).start();
  const handleOut = () => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPressIn={handleIn} onPressOut={handleOut} onPress={onPress}
        style={{ backgroundColor: '#F1F5F9', padding: 20, borderRadius: 20, borderLeftWidth: 5, borderLeftColor: color }}>
        <Text style={{ fontWeight: '900', color: COLORS.navy, fontSize: 16 }}>{title}</Text>
        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
      </Pressable>
    </Animated.View>
  );
};