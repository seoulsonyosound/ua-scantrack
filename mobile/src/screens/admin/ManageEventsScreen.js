import React, { useEffect, useState, useRef } from "react";
import { 
  ActivityIndicator, SafeAreaView, Text, Pressable, View, 
  Alert, ScrollView, Animated, Easing, RefreshControl, Platform 
} from "react-native";
import { listEvents, deleteEvent } from "../../api/events";
import styles, { COLORS } from "../../styles/styles";

// --- STYLED & ANIMATED CARD ---
const EventCard = ({ ev, navigation, onRefresh, onConfirmDelete, deletingId, index }) => {
  const eventId = ev.id || ev._id;
  const isDeleting = deletingId === eventId;

  // ANIMATION REFS
  const cardScale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in and slide up effect on mount
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      delay: index * 100, // Staggered entry
      useNativeDriver: true,
    }).start();
  }, []);

  const handleHover = (isHovering) => {
    if (Platform.OS !== 'web') return;
    Animated.spring(cardScale, {
      toValue: isHovering ? 1.02 : 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ 
      opacity, 
      transform: [{ scale: cardScale }],
      marginBottom: 12 
    }}>
      <View style={{ 
        backgroundColor: 'white', 
        borderRadius: 20, 
        padding: 16, 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
          ios: { shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
          android: { elevation: 3 },
          web: { boxShadow: '0 4px 12px rgba(100, 116, 139, 0.08)' }
        })
      }}>
        {/* Left Side: Info */}
        <Pressable 
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
          onPress={() => navigation.navigate("AdminEventDetails", { event: ev })}
          style={{ flex: 1, paddingRight: 10 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.orange, marginRight: 8 }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.orange }}>
              {ev.event_date}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.navy }}>{ev.title}</Text>
          <Text style={{ color: '#64748B', fontSize: 13 }}>{ev.venue}</Text>
        </Pressable>

        {/* Right Side: Actions */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable 
            onPress={() => navigation.navigate("EditEvent", { event: ev, onDone: onRefresh })} 
            style={({ pressed }) => [
              { backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
              pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
            ]}
          >
            <Text style={{ fontWeight: '800', fontSize: 11, color: COLORS.navy }}>EDIT</Text>
          </Pressable>
          
          <Pressable 
            onPress={() => onConfirmDelete(eventId)} 
            disabled={isDeleting}
            style={({ pressed }) => [
              { backgroundColor: isDeleting ? '#F1F5F9' : '#FEF2F2', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
              pressed && { opacity: 0.6, transform: [{ scale: 0.95 }] }
            ]}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 11 }}>REMOVE</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

export function ManageEventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Background Circle Animation
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => { 
    refresh(); 
    Animated.loop(
      Animated.timing(spinValue, { 
        toValue: 1, duration: 60000, easing: Easing.linear, useNativeDriver: true 
      })
    ).start();
  }, []);

  const refresh = async () => {
    setBusy(true);
    try {
      const data = await listEvents();
      setEvents(data || []);
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setBusy(false);
    }
  };

  const performDelete = async (id) => {
    setDeletingId(id);
    try { 
      await deleteEvent(id); 
      setEvents(prev => prev.filter(item => (item.id || item._id) !== id));
    } catch (e) { 
      Alert.alert("Error", "Server failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Permanently remove this event?")) performDelete(id);
    } else {
      Alert.alert("Confirm Delete", "This action cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => performDelete(id) }
      ]);
    }
  };

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* KINETIC BACKGROUND */}
      <View pointerEvents="none" style={{ position: 'absolute', zIndex: -1 }}>
        <Animated.View style={{ 
          width: 500, height: 500, borderRadius: 250, backgroundColor: COLORS.navy, 
          opacity: 0.03, top: -200, left: -200, transform: [{ rotate: spin }] 
        }} />
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={busy} onRefresh={refresh} tintColor={COLORS.orange} />}
      >
        <View style={{ marginBottom: 25 }}>
          <View style={{ height: 4, width: 30, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 8 }} />
          <Text style={{ fontSize: 12, fontWeight: '900', color: '#94A3B8', letterSpacing: 2 }}>ADMIN PANEL</Text>
          <Text style={{ fontSize: 32, fontWeight: '900', color: COLORS.navy }}>Manage Events</Text>
        </View>

        <Pressable 
          onPress={() => navigation.navigate("CreateEvent", { onDone: refresh })}
          style={({ pressed }) => [
            { backgroundColor: COLORS.navy, padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 25 },
            pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
          ]}
        >
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 14 }}>+ INITIALIZE NEW EVENT</Text>
        </Pressable>

        <View>
          {events.map((ev, index) => (
            <EventCard 
              key={ev.id || ev._id} 
              ev={ev} 
              index={index}
              navigation={navigation}
              onRefresh={refresh}
              onConfirmDelete={confirmDelete}
              deletingId={deletingId}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}