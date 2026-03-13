import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const PREVIEW_SEGMENTS = [
  {
    safe: true,
    coords: [
      { latitude: -37.8083, longitude: 144.9632 },
      { latitude: -37.8071, longitude: 144.9641 },
    ],
  },
  {
    safe: false,
    coords: [
      { latitude: -37.8071, longitude: 144.9641 },
      { latitude: -37.806, longitude: 144.9648 },
    ],
  },
  {
    safe: true,
    coords: [
      { latitude: -37.806, longitude: 144.9648 },
      { latitude: -37.8045, longitude: 144.9655 },
    ],
  },
];

const PREVIEW_INCIDENTS = [
  { latitude: -37.8065, longitude: 144.9647 },
  { latitude: -37.8061, longitude: 144.965 },
];

const LIGHT_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: colors.mapBackground }] },
  { elementType: "labels.text.fill", stylers: [{ color: colors.textMuted }] },
  { elementType: "labels.text.stroke", stylers: [{ color: colors.mapBackground }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#E2E8F0" }] },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#CBD5E1" }],
  },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#E0F2FE" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export default function SafetyMapPreview() {
  const router = useRouter();

  const openMap = () => {
    router.push("/(tabs)/map");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Map Preview</Text>
        <TouchableOpacity onPress={openMap} activeOpacity={0.8}>
          <Text style={styles.link}>View full map</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.previewCard} onPress={openMap} activeOpacity={0.9}>
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
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          onPress={openMap}
        >
          {PREVIEW_SEGMENTS.map((seg, i) => (
            <Polyline
              key={i}
              coordinates={seg.coords}
              strokeColor={seg.safe ? colors.routeSafe : colors.routeDanger}
              strokeWidth={seg.safe ? 4 : 5}
              lineDashPattern={seg.safe ? undefined : [8, 4]}
            />
          ))}

          {PREVIEW_INCIDENTS.map((inc, i) => (
            <Circle
              key={i}
              center={inc}
              radius={30}
              fillColor={colors.incidentFill}
              strokeColor={colors.incidentStroke}
              strokeWidth={1}
            />
          ))}

          <Marker coordinate={{ latitude: -37.8069, longitude: 144.9642 }}>
            <View style={styles.userPin} />
          </Marker>
        </MapView>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>You</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34 / 2,
    fontWeight: "700",
  },
  link: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  previewCard: {
    height: 170,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.mapPreviewBackground,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  userPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  badge: {
    position: "absolute",
    top: 70,
    right: 122,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
});
