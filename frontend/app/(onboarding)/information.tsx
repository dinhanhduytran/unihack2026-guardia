import Container from "@/components/Container";
import { colors } from "@/constants/colors";
import { useAppDispatch } from "@/store/hooks";
import { saveOnboardingProfile } from "@/store/userProfileSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OnboardingInformationScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [allowNotifications, setAllowNotifications] = useState(true);

  const canContinue = useMemo(() => {
    return (
      name.trim().length > 0 &&
      emergencyContactName.trim().length > 0 &&
      emergencyContactPhone.trim().length > 0
    );
  }, [name, emergencyContactName, emergencyContactPhone]);

  const onContinue = () => {
    if (!canContinue) return;
    dispatch(
      saveOnboardingProfile({
        name: name.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        allowNotifications,
      }),
    );
    router.replace("/(tabs)");
  };

  return (
    <Container
      backgroundColor={colors.surface}
      contentStyle={styles.container}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text style={styles.brand}>SafeRoute</Text>
      <Text style={styles.subtitle}>Set up your emergency details</Text>

      <View style={styles.form}>
        <Text style={styles.inputLabel}>YOUR NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Sarah"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>EMERGENCY CONTACT NAME</Text>
        <TextInput
          value={emergencyContactName}
          onChangeText={setEmergencyContactName}
          placeholder="Mum (Linda)"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>EMERGENCY CONTACT PHONE</Text>
        <TextInput
          value={emergencyContactPhone}
          onChangeText={setEmergencyContactPhone}
          placeholder="+61 412 345 678"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <View style={styles.notifyCard}>
          <View style={styles.notifyLeft}>
            <View style={styles.notifyIconWrap}>
              <Ionicons name="notifications-outline" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.notifyTitle}>Allow notifications</Text>
              <Text style={styles.notifySubtitle}>
                Get safety alerts and route updates
              </Text>
            </View>
          </View>
          <Switch
            value={allowNotifications}
            onValueChange={setAllowNotifications}
            thumbColor={colors.surface}
            trackColor={{ false: colors.borderSoft, true: colors.primary }}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
        activeOpacity={0.9}
        onPress={onContinue}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.surface} />
      </TouchableOpacity>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  brand: {
    marginTop: 6,
    color: colors.primary,
    textAlign: "center",
    fontSize: 42 / 2,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 10,
    color: colors.textBody,
    textAlign: "center",
    fontSize: 16,
  },
  form: {
    gap: 8,
  },
  inputLabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    fontSize: 16,
  },
  notifyCard: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notifyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notifyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  notifyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  notifySubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 7,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "700",
  },
});
