import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, Text, View, Pressable, ScrollView, Animated, Easing, Platform, Dimensions } from "react-native";
import styles, { COLORS } from "../../styles/styles"; 
import { logout } from "../../utils/logout";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function StudentHomeScreen({ navigation }) {
  // ANIMATION REFS FROM ADMIN HOME
  const shapeRotation = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.timing(shapeRotation, { 
          toValue: 1, 
          duration: 25000, 
          easing: Easing.linear, 
          useNativeDriver: true 
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
        ])
      )
    ]).start();
  }, []);

  const spin = shapeRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const float = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30]
  });

  // REUSABLE NAV TILE COMPONENT
  const NavTile = ({ label, title, screen, color = COLORS.navy }) => {
    const revealAnim = useRef(new Animated.Value(0)).current;
    const [startPos, setStartPos] = useState({ top: 0, left: 0, right: 0, bottom: 0 });

    const handleMouseEnter = (e) => {
      if (Platform.OS !== 'web') return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const absX = Math.abs(x);
      const absY = Math.abs(y);

      let newPos = { top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' };

      if (absX > absY) {
        x > 0 ? newPos = { ...newPos, right: 0, left: 'auto', width: '0%' }
              : newPos = { ...newPos, left: 0, right: 'auto', width: '0%' };
      } else {
        y > 0 ? newPos = { ...newPos, bottom: 0, top: 'auto', height: '0%' }
              : newPos = { ...newPos, top: 0, bottom: 'auto', height: '0%' };
      }

      setStartPos(newPos);
      Animated.timing(revealAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    };

    const handleMouseLeave = () => {
      Animated.timing(revealAnim, { toValue: 0, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: false }).start();
    };

    const isVertical = startPos.width === '100%';

    return (
      <Pressable 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        onPress={() => navigation.navigate(screen)}
        style={({ pressed }) => [
          { 
            width: SCREEN_WIDTH > 768 ? '31%' : '48.5%',               
            height: 160,
            marginBottom: 15,
            overflow: 'hidden', 
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: '#F1F5F9',
            padding: 15,
            justifyContent: 'flex-end',
            transform: [{ scale: pressed ? 0.97 : 1 }],
            elevation: 4,
          }
        ]} 
      >
        {/* LARGE BACKGROUND INITIAL */}
        <Animated.Text 
          style={{
            position: 'absolute', top: -10, right: -5, fontSize: 80, fontWeight: '900', color: color, zIndex: 0,
            opacity: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.04] }),
          }}
        >
          {label[0]}
        </Animated.Text>

        {/* REVEAL OVERLAY */}
        <Animated.View 
          style={{
            position: 'absolute', backgroundColor: color, opacity: 0.09, zIndex: 1,
            top: startPos.top, left: startPos.left, right: startPos.right, bottom: startPos.bottom,
            width: !isVertical ? revealAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) : '100%',
            height: isVertical ? revealAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) : '100%',
          }} 
        />

        <View style={{ zIndex: 2 }}>
          <Text style={{ color: color, fontWeight: '800', fontSize: 10, letterSpacing: 2, marginBottom: 2 }}>
            {label.toUpperCase()}
          </Text>
          <Text style={{ color: '#111d38', fontSize: 16, fontWeight: '800', lineHeight: 20 }}>
            {title}
          </Text>
          <Animated.View style={{ 
            height: 3, backgroundColor: color, marginTop: 8, borderRadius: 2, 
            width: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [25, 60] }) 
          }} />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      {/* SHAPES AT BOTTOM LAYER (SYNCED FROM ADMIN) */}
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}>
        <Animated.View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: COLORS.navy, top: -150, left: -100, transform: [{ rotate: spin }], opacity: 0.08 }} />
        <Animated.View style={{ position: 'absolute', width: 250, height: 250, borderRadius: 50, backgroundColor: COLORS.orange, bottom: 50, right: -50, transform: [{ rotate: spin }, { translateY: float }], opacity: 0.12 }} />
      </View>

      <ScrollView style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ padding: SCREEN_WIDTH > 600 ? 40 : 20 }}>
        {/* HEADER SECTION */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 30 }}>
          <View style={{ flexShrink: 1, marginRight: 10 }}>
            <View style={{ height: 4, width: 30, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 10 }} />
            <Text style={[styles.kicker, { letterSpacing: 4, color: COLORS.orange }]}>STUDENT PORTAL</Text>
            <Text style={[styles.heroTitle, { fontSize: SCREEN_WIDTH > 600 ? 48 : 36, fontWeight: '900', color: COLORS.navy }]}>Dashboard</Text>
          </View>
          
          <Pressable 
            style={({ pressed }) => [{ 
              backgroundColor: '#880808', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, 
              opacity: pressed ? 0.8 : 1, marginTop: 10 
            }]} 
            onPress={() => logout(navigation)}
          >
            <Text style={{ color: 'white', fontWeight: '800', letterSpacing: 1, fontSize: 12 }}>LOGOUT</Text>
          </Pressable>
        </View>

        {/* RESPONSIVE GRID */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <NavTile label="Events" title="Activity Feed" screen="StudentEvents" color="#2d52b6" />
          <NavTile label="Profile" title="My Identity" screen="StudentProfile" color="#64748b" />
          <NavTile label="History" title="Attendance" screen="StudentAttendanceHistory" color="#059669" />
          
          
          {/* Alignment Filler */}
          <View style={{ width: SCREEN_WIDTH > 768 ? '31%' : '48.5%' }} /> 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}