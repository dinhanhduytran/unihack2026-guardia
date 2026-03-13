import Container from "@/components/Container";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OnboardingScreen() {
  const router = useRouter();

  const onGetStarted = () => {
    router.push("/(onboarding)/information");
  };

  return (
    <Container
      backgroundColor={colors.surface}
      contentStyle={styles.container}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text style={styles.brand}>SafeRoute</Text>

      <View style={styles.heroWrap}>
        <View style={styles.dotLeft} />
        <View style={styles.dotRight} />
        <View style={styles.heroCircle}>
          <Ionicons name="shield-checkmark" size={52} color={colors.primary} />
        </View>
      </View>

      <View style={styles.copyWrap}>
        <Text style={styles.title}>Walk home{"\n"}fearlessly.</Text>
        <Text style={styles.subtitle}>
          Your elegant companion for every journey. Trusted, safe, and always by
          your side.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.9}
        onPress={onGetStarted}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 28,
    justifyContent: "space-between",
  },
  brand: {
    color: colors.primary,
    textAlign: "center",
    fontSize: 42 / 2,
    fontWeight: "700",
  },
  heroWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  heroCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD7DE",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  dotLeft: {
    position: "absolute",
    left: 16,
    bottom: 34,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFC8D1",
  },
  dotRight: {
    position: "absolute",
    right: 28,
    top: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFC8D1",
  },
  copyWrap: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: 52 / 2,
    lineHeight: 60 / 2,
    fontWeight: "500",
  },
  subtitle: {
    marginTop: 14,
    color: colors.textBody,
    textAlign: "center",
    fontSize: 18 / 1.1,
    lineHeight: 28 / 1.1,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "700",
  },
});
