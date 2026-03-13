import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";

type RecentRouteItem = {
  id: string;
  title: string;
  meta: string;
  score: number;
  icon: keyof typeof Ionicons.glyphMap;
  isPrimary?: boolean;
};

const RECENT_ROUTES: RecentRouteItem[] = [
  {
    id: "central-park-loop",
    title: "Central Park Loop",
    meta: "15 min • 1.2 miles",
    score: 98,
    icon: "navigate-outline",
    isPrimary: true,
  },
  {
    id: "downtown-express",
    title: "Downtown Express",
    meta: "8 min • 0.5 miles",
    score: 98,
    icon: "time-outline",
  },
  {
    id: "work-to-home",
    title: "Work to Home",
    meta: "22 min • 3.4 miles",
    score: 98,
    icon: "briefcase-outline",
  },
];

export default function RecentRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Routes</Text>
      <FlatList
        data={RECENT_ROUTES}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View
              style={[
                styles.iconWrap,
                item.isPrimary && styles.iconWrapPrimary,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={28}
                color={item.isPrimary ? colors.primary : colors.iconMuted}
              />
            </View>

            <View style={styles.infoContainer}>
              <Text
                style={styles.routeTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
              <Text style={styles.routeMeta}>{item.meta}</Text>
            </View>

            <View style={styles.rightContainer}>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>SAFE SCORE: {item.score}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={colors.textSecondary}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 44 / 2,
    fontWeight: "700",
    marginBottom: 14,
  },
  listContent: {
    gap: 12,
    paddingBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#EFF3F8",
  },
  iconWrapPrimary: {
    backgroundColor: colors.surfaceSoft,
  },
  infoContainer: {
    flex: 1,
  },
  routeTitle: {
    color: colors.textPrimary,
    fontSize: 20 / 1.2,
    fontWeight: "700",
    marginBottom: 2,
  },
  routeMeta: {
    color: colors.textSecondary,
    fontSize: 32 / 2,
    fontWeight: "500",
  },
  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
  },
  scoreBadge: {
    borderRadius: 999,
    backgroundColor: colors.badgeBackground,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  scoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
