import React, { useEffect, useState, useRef } from "react";
import { 
  Alert, ActivityIndicator, SafeAreaView, Text, TextInput, 
  Pressable, View, ScrollView, Animated, Easing 
} from "react-native";
import { api } from "../../api/client"; 
import styles, { COLORS } from "../../styles/styles";
// add delete if possiible
// INTERNAL COMPONENT FOR THE SPRING EFFECT
const StudentCard = ({ s, onEdit, isEditing }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 1.03, friction: 4, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 12 }}>
      <Pressable 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onEdit(s)}
        style={{ 
          backgroundColor: 'white', padding: 20, borderRadius: 24, elevation: 4, 
          borderWidth: 1, borderColor: isEditing ? COLORS.orange : '#F1F5F9', 
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '900', color: COLORS.navy, fontSize: 16 }}>{s.last_name.toUpperCase()}, {s.first_name}</Text>
          <Text style={{ color: COLORS.orange, fontSize: 11, fontWeight: '800' }}>{s.student_no} • {s.course} • YR {s.year_level}</Text>
        </View>
        <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
          <Text style={{ color: COLORS.navy, fontWeight: '900', fontSize: 10 }}>EDIT</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export function ManageStudentScreen() {
  const [students, setStudents] = useState([]);
  const [busy, setBusy] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const shapeRotation = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState({ 
    student_no: "", first_name: "", last_name: "", course: "", year_level: "1"   
  });

  useEffect(() => {
    Animated.loop(
      Animated.timing(shapeRotation, { toValue: 1, duration: 35000, easing: Easing.linear, useNativeDriver: true })
    ).start();
    refresh();
  }, []);

  async function refresh() {
    setBusy(true);
    try {
      const res = await api.get("/students/"); 
      setStudents(res.data || []);
    } catch (e) { console.error(e); } finally { setBusy(false); }
  }

  const handleSave = async () => {
    if (!form.student_no || !form.first_name) return Alert.alert("Required", "Please fill essential fields.");
    setBusy(true);
    try {
      if (editingId) await api.put(`/students/${editingId}/`, form);
      else await api.post("/students/", form);
      setEditingId(null);
      setForm({student_no:"", first_name:"", last_name:"", course:"", year_level:"1"});
      refresh();
    } catch (e) { Alert.alert("Error", "Save failed."); }
    finally { setBusy(false); }
  };

  const spin = shapeRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#F8FAFC' }]}>
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Animated.View style={{ position: 'absolute', width: 600, height: 600, borderRadius: 300, backgroundColor: COLORS.navy, bottom: -200, left: -200, transform: [{ rotate: spin }], opacity: 0.03 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.headerSection}>
          <View style={{ height: 4, width: 40, backgroundColor: COLORS.orange, borderRadius: 2, marginBottom: 12 }} />
          <Text style={styles.heroTitle}>Student Registry</Text>
        </View>

        <View style={{ backgroundColor: 'white', padding: 25, borderRadius: 28, elevation: 6, marginTop: 20, marginBottom: 30, borderWidth: 1, borderColor: '#F1F5F9' }}>
          <Text style={{ color: COLORS.navy, fontSize: 11, fontWeight: '900', marginBottom: 15 }}>{editingId ? "UPDATE STUDENT" : "NEW REGISTRATION"}</Text>
          <TextInput placeholder="Student ID" style={[styles.borderedInput, { borderRadius: 14, marginBottom: 12, padding: 15 }]} value={form.student_no} onChangeText={v => setForm({...form, student_no: v})} />
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <TextInput placeholder="First" style={[styles.borderedInput, { flex: 1, borderRadius: 14, padding: 15 }]} value={form.first_name} onChangeText={v => setForm({...form, first_name: v})} />
            <TextInput placeholder="Last" style={[styles.borderedInput, { flex: 1, borderRadius: 14, padding: 15 }]} value={form.last_name} onChangeText={v => setForm({...form, last_name: v})} />
          </View>
          <TextInput placeholder="Course" style={[styles.borderedInput, { borderRadius: 14, marginBottom: 15, padding: 15 }]} value={form.course} onChangeText={v => setForm({...form, course: v})} />

          <Text style={{ color: COLORS.navy, fontSize: 10, fontWeight: '900', marginBottom: 8, marginLeft: 4 }}>YEAR LEVEL</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 25 }}>
            {["1", "2", "3", "4"].map((yr) => (
              <Pressable key={yr} onPress={() => setForm({...form, year_level: yr})} style={({ pressed }) => [{ flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: form.year_level === yr ? COLORS.navy : (pressed ? '#E2E8F0' : '#F1F5F9'), borderWidth: 1, borderColor: form.year_level === yr ? COLORS.navy : '#E2E8F0' }]}>
                <Text style={{ color: form.year_level === yr ? 'white' : COLORS.navy, fontWeight: '900' }}>{yr}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={handleSave} style={({ pressed }) => [{ backgroundColor: COLORS.navy, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}>
            {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '900' }}>{editingId ? "SAVE CHANGES" : "ADD STUDENT"}</Text>}
          </Pressable>
        </View>

        <View style={{ paddingBottom: 40 }}>
          {students.map((s) => (
            <StudentCard 
              key={s.id} 
              s={s} 
              isEditing={editingId === s.id}
              onEdit={(selected) => { setEditingId(selected.id); setForm({...selected}); }} 
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}