import React, { useState } from "react";
// ADDED: StyleSheet and Pressable to the import list
import { Alert, SafeAreaView, Text, View, StyleSheet, Pressable } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { logout } from "../../utils/logout";
import { downloadReportCsv } from "../../api/reports";
// FIX: Ensure this path correctly goes up to your styles folder
import { COLORS } from "../../styles/styles"; 

export function SummaryScreen({ route, navigation }) {
  const { event, stats, last } = route.params;
  const [busy, setBusy] = useState(false);

  return (
    <SafeAreaView style={ui.container}>
      <View style={ui.receipt}>
        <Text style={ui.receiptHeader}>SESSION SUMMARY</Text>
        
        <View style={ui.statsGrid}>
          <View style={ui.statBox}>
            <Text style={ui.statLabel}>PRESENT</Text>
            <Text style={ui.statNum}>{stats?.present ?? 0}</Text>
          </View>
          <View style={ui.statBox}>
            {/* Added optional chaining to COLORS to prevent crash if import fails */}
            <Text style={[ui.statLabel, { color: COLORS?.orange || '#FF8C00' }]}>LATE</Text>
            <Text style={[ui.statNum, { color: COLORS?.orange || '#FF8C00' }]}>{stats?.late ?? 0}</Text>
          </View>
        </View>
      </View>

      <View style={ui.actionArea}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={[ui.btn, { borderColor: COLORS?.navy || '#002D62', borderWidth: 2 }]}
        >
          <Text style={{ color: COLORS?.navy || '#002D62', fontWeight: '900' }}>RESUME SCANNING</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const ui = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', padding: 20 },
  receipt: { backgroundColor: '#fff', borderRadius: 30, padding: 30, elevation: 10 },
  receiptHeader: { textAlign: 'center', fontWeight: '900', color: '#94A3B8', marginBottom: 30 },
  statsGrid: { flexDirection: 'row', gap: 15 },
  statBox: { flex: 1, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 15, alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: '900', marginBottom: 5 },
  statNum: { fontSize: 28, fontWeight: '900' },
  actionArea: { marginTop: 30 },
  btn: { padding: 20, borderRadius: 18, alignItems: 'center' }
});