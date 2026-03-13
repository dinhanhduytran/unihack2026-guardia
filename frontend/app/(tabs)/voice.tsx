import Container from "@/components/Container";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const WAVE_BARS = [22, 34, 52, 66, 52, 34, 22, 14];

type QuickCommand = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  primary: boolean;
  disabled?: boolean;
};

const QUICK_COMMANDS: QuickCommand[] = [
  { id: "help", label: '"Help me"', icon: "medkit-outline", primary: true },
  {
    id: "police",
    label: '"Call police"',
    icon: "shield-checkmark-outline",
    primary: true,
  },
  {
    id: "home",
    label: '"I\'m home safe"',
    icon: "home-outline",
    primary: false,
  },
  {
    id: "reroute",
    label: '"Reroute me"',
    icon: "git-branch-outline",
    primary: false,
  },
];

export default function VoiceScreen() {
  return (
    <Container
      backgroundColor={colors.surface}
      contentStyle={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Listening...</Text>
        <Text style={styles.subtitle}>
          Say a command or tap a shortcut below
        </Text>

        <View style={styles.waveRow}>
          {WAVE_BARS.map((height, index) => (
            <View
              key={`${height}-${index}`}
              style={[styles.waveBar, { height }]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.micButton} activeOpacity={0.9}>
          <Ionicons name="mic-outline" size={28} color={colors.surface} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Quick Commands</Text>
        <View style={styles.commandGrid}>
          {QUICK_COMMANDS.map((command) => (
            <TouchableOpacity
              key={command.id}
              style={[
                styles.commandChip,
                command.primary && styles.commandChipPrimary,
                command.disabled && styles.commandChipDisabled,
              ]}
              activeOpacity={0.9}
            >
              <Ionicons
                name={command.icon}
                size={16}
                color={
                  command.primary
                    ? colors.surface
                    : command.disabled
                      ? colors.textSecondary
                      : colors.textPrimary
                }
              />
              <Text
                style={[
                  styles.commandText,
                  command.primary && styles.commandTextPrimary,
                  command.disabled && styles.commandTextDisabled,
                ]}
              >
                {command.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.infoAccent}
          />
          <Text style={styles.infoText}>
            SafeRoute uses your voice to trigger emergency protocols. Your
            location will be shared with emergency contacts if SOS is triggered.
          </Text>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 20,
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
  title: {
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: 54 / 2,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    fontSize: 16,
  },
  waveRow: {
    marginTop: 30,
    marginBottom: 30,
    height: 70,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
  },
  waveBar: {
    width: 4,
    borderRadius: 999,
    backgroundColor: colors.primary,
    opacity: 0.9,
  },
  micButton: {
    alignSelf: "center",
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
    marginBottom: 38,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 34 / 2,
    fontWeight: "700",
    marginBottom: 12,
  },
  commandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginBottom: 14,
  },
  commandChip: {
    width: "48%",
    minHeight: 76,
    borderRadius: 30,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
    gap: 6,
  },
  commandChipPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  commandChipDisabled: {
    backgroundColor: colors.chipMuted,
    borderColor: colors.borderSoft,
    opacity: 0.7,
  },
  commandText: {
    color: colors.textPrimary,
    fontSize: 30 / 2,
    fontWeight: "700",
  },
  commandTextPrimary: {
    color: colors.surface,
  },
  commandTextDisabled: {
    color: colors.textSecondary,
  },
  infoCard: {
    marginTop: "auto",
    borderRadius: 16,
    backgroundColor: colors.infoSoft,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoText: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500",
    flex: 1,
  },
});
