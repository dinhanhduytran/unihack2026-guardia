import { colors } from "@/constants/colors";
import Container from "@/components/Container";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Circle,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";

// ── MOCK DATA để Vĩ test route (thay bằng API sau) ──
const MOCK_SEGMENTS = [
  {
    safe: true,
    coords: [
      { latitude: -37.8083, longitude: 144.9632 },
      // { latitude: -37.8079, longitude: 144.9638 },
      { latitude: -37.8071, longitude: 144.9641 },
    ],
  },
  {
    safe: false, // đoạn nguy hiểm → đỏ
    coords: [
      { latitude: -37.8071, longitude: 144.9641 },
      // { latitude: -37.8065, longitude: 144.9645 },
      { latitude: -37.806, longitude: 144.9648 },
    ],
  },
  {
    safe: true,
    coords: [
      { latitude: -37.806, longitude: 144.9648 },
      { latitude: -37.8052, longitude: 144.9652 },
      { latitude: -37.8045, longitude: 144.9655 },
    ],
  },
];

const MOCK_INCIDENTS = [
  { latitude: -37.8065, longitude: 144.9647 },
  { latitude: -37.8061, longitude: 144.965 },
];

const LIGHT_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: colors.mapBackground }] },
  { elementType: "labels.text.fill", stylers: [{ color: colors.textMuted }] },
  { elementType: "labels.text.stroke", stylers: [{ color: colors.mapBackground }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#E2E8F0" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#CBD5E1" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#E0F2FE" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export default function MapScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "85%"], []);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // fallback: dùng Melbourne CBD
        setUserLocation({ latitude: -37.8083, longitude: 144.9632 });
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Container
        backgroundColor={colors.mapBackground}
        withHorizontalPadding={false}
      >
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Container>
    );
  }

  return (
    <Container
      backgroundColor={colors.mapBackground}
      withHorizontalPadding={false}
    >
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={LIGHT_MAP_STYLE}
        initialRegion={{
          latitude: -37.8064,
          longitude: 144.9644,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false}
        showsCompass={false}
        showsMyLocationButton={false}
      >
        {MOCK_SEGMENTS.map((seg, i) => (
          <Polyline
            key={i}
            coordinates={seg.coords}
            strokeColor={seg.safe ? colors.routeSafe : colors.routeDanger}
            strokeWidth={seg.safe ? 5 : 6}
            lineDashPattern={seg.safe ? undefined : [8, 4]}
          />
        ))}

        {MOCK_INCIDENTS.map((inc, i) => (
          <Circle
            key={i}
            center={inc}
            radius={40}
            fillColor={colors.incidentFill}
            strokeColor={colors.incidentStroke}
            strokeWidth={1}
          />
        ))}

        <Marker coordinate={MOCK_SEGMENTS[0].coords[0]}>
          <View style={styles.pinStart} />
        </Marker>

        <Marker coordinate={MOCK_SEGMENTS[2].coords[2]}>
          <View style={styles.pinEnd} />
        </Marker>

        {userLocation && (
          <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.userDotWrap}>
              <View style={styles.userPulse} />
              <View style={styles.userDot} />
            </View>
          </Marker>
        )}
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={styles.grabber}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomPanel}>
          <View style={styles.tipCard}>
            <View style={styles.tipIconWrap}>
              <Ionicons name="sparkles" size={16} color={colors.surface} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>SafeRoute AI Tip</Text>
              <Text style={styles.tipText}>
                The coral route has 40% more street lighting and avoids recent
                construction zones.
              </Text>
            </View>
          </View>

          <View style={styles.optionRow}>
            <View style={[styles.optionCard, styles.optionCardPrimary]}>
              <View style={styles.optionTopRow}>
                <Text style={styles.optionBadgePrimary}>SAFEST</Text>
                <Text style={styles.optionTime}>12 min</Text>
              </View>
              <Text style={styles.optionMeta}>Distance</Text>
              <Text style={styles.optionDistance}>1.8 miles</Text>
              <View style={styles.scoreRow}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.optionScorePrimary}>98/100 Safety Score</Text>
              </View>
            </View>

            <View style={styles.optionCard}>
              <View style={styles.optionTopRow}>
                <Text style={styles.optionBadgeAlt}>ALTERNATIVE</Text>
                <Text style={styles.optionTime}>9 min</Text>
              </View>
              <Text style={styles.optionMeta}>Distance</Text>
              <Text style={styles.optionDistance}>1.4 miles</Text>
              <View style={styles.scoreRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.optionScoreAlt}>72/100 Safety Score</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} activeOpacity={0.9}>
            <Text style={styles.startButtonText}>Start Safe Journey</Text>
            <Ionicons name="navigate-outline" size={20} color={colors.surface} />
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </Container>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.mapBackground,
  },

  // pins
  pinStart: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.routeSafe,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  pinEnd: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
  },

  // user dot
  userDotWrap: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  userPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.userPulse,
  },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
  },

  bottomPanel: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 14,
  },
  bottomSheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  grabber: {
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.grabber,
  },
  tipCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surfaceSoft,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  tipIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: { flex: 1 },
  tipTitle: {
    color: colors.textPrimary,
    fontSize: 28 / 2,
    fontWeight: "700",
    marginBottom: 2,
  },
  tipText: {
    color: colors.textBody,
    fontSize: 15,
    lineHeight: 21,
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  optionCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.cardBackground,
    padding: 10,
  },
  optionCardPrimary: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSoft,
  },
  optionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  optionBadgePrimary: {
    color: colors.surface,
    backgroundColor: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  optionBadgeAlt: {
    color: colors.textMuted,
    backgroundColor: colors.badgeAltBackground,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  optionTime: {
    color: colors.textPrimary,
    fontSize: 26 / 2,
    fontWeight: "700",
  },
  optionMeta: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 2,
  },
  optionDistance: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  optionScorePrimary: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
  optionScoreAlt: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
  startButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    color: colors.surface,
    fontSize: 31 / 2,
    fontWeight: "700",
  },
});
