import EStyleSheet from "react-native-extended-stylesheet";

export const COLORS = {
  red: "#ad0303",
  navy: "#091b54",
  orange: "#cf7f00",
  bg: "#e4e4e7", 
  surface: "#ffffff",
  ink: "#0f172a",
  muted: "#94a3b8",
  border: "#cbd5e1", 
};

export default EStyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20 },

  // Header
  headerSection: { marginBottom: 30, marginTop: 10 },
  kicker: { color: COLORS.orange, fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  heroTitle: { color: COLORS.navy, fontSize: 28, fontWeight: "900" },

  // Grid
  flexGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  flexTile: {
    backgroundColor: COLORS.surface,
    width: '48%',
    aspectRatio: 1.1,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
    elevation: 2,
  },
  tileLabel: { fontSize: 10, fontWeight: "800", color: COLORS.muted, textTransform: "uppercase" },
  tileTitle: { fontSize: 18, fontWeight: "900", color: COLORS.navy, marginTop: 4 },

  // Inputs with Visible Borders
  inputGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: "700", color: COLORS.navy, marginBottom: 6 },
  borderedInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    color: COLORS.ink,
  },

  // Centered & Gapped Buttons
  buttonWrapper: { alignItems: 'center', marginVertical: 10 },
  btnSmall: {
    backgroundColor: COLORS.navy,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 160,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  
  // Records/Cards
  recordCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  }
});