import { colors } from "@/constants/colors";
import Container from "@/components/Container";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AUTO_ACTIONS = [
  { id: "location", label: "Real-time location shared", done: true },
  { id: "recording", label: "Audio recording started", done: true },
  { id: "notify", label: "Notifying emergency contacts...", done: false },
];

export default function AlertsScreen() {
  return (
    <Container
      backgroundColor={colors.surfaceSoft}
      contentStyle={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          <Text style={styles.brand}>SafeRoute</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroIcon}>
          <Ionicons name="alert-circle" size={40} color={colors.primary} />
        </View>

        <Text style={styles.title}>Emergency Alert</Text>
        <Text style={styles.subtitle}>Initiating emergency protocols...</Text>

        <View style={styles.timerRing}>
          <Text style={styles.timerValue}>08</Text>
          <Text style={styles.timerUnit}>SECONDS</Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>AUTO-ACTIONS ACTIVE</Text>
          {AUTO_ACTIONS.map((action) => (
            <View style={styles.actionRow} key={action.id}>
              <Ionicons
                name={action.done ? "checkmark" : "time-outline"}
                size={16}
                color={action.done ? colors.textPrimary : colors.textSecondary}
              />
              <Text style={[styles.actionText, !action.done && styles.actionTextMuted]}>
                {action.label}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.callButton} activeOpacity={0.9}>
          <Ionicons name="call-outline" size={20} color={colors.surface} />
          <Text style={styles.callButtonText}>Call Emergency Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.safeButton} activeOpacity={0.9}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.safeButtonText}>I&apos;m Safe (Cancel)</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 24,
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 23 / 2,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 20,
    height: 20,
  },
  heroIcon: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dangerSoft,
    marginBottom: 20,
  },
  title: {
    color: colors.primary,
    fontSize: 44 / 2,
    fontWeight: "500",
    textAlign: "center",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 26,
  },
  timerRing: {
    alignSelf: "center",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 10,
    borderColor: colors.dangerRing,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    marginBottom: 22,
  },
  timerValue: {
    color: colors.textPrimary,
    fontSize: 56 / 2,
    fontWeight: "800",
  },
  timerUnit: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  actionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    padding: 14,
    marginBottom: 20,
  },
  actionTitle: {
    color: colors.infoAccent,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  actionTextMuted: {
    color: colors.textSecondary,
  },
  callButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
    marginBottom: 12,
  },
  callButtonText: {
    color: colors.surface,
    fontSize: 22 / 2,
    fontWeight: "700",
  },
  safeButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutralBackground,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  safeButtonText: {
    color: colors.textPrimary,
    fontSize: 22 / 2,
    fontWeight: "700",
  },
});
