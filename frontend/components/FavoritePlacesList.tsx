import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";

type FavoritePlace = {
  id: number;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  route?: "/(tabs)/map";
};

// list of chips for favorite places horizontally
const FavoritePlaces: FavoritePlace[] = [
  {
    id: 1,
    name: "Home",
    icon: "home-outline",
    active: true,
  },
  {
    id: 2,
    name: "Work",
    icon: "briefcase-outline",
    active: false,
  },
  {
    id: 3,
    name: "Gym",
    icon: "barbell-outline",
    active: false,
  },
  {
    id: 4,
    name: "Map",
    icon: "map-outline",
    active: false,
    route: "/(tabs)/map",
  },
];

export default function FavoritePlacesList() {
  const router = useRouter();

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      horizontal
      data={FavoritePlaces}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.chipContainer,
            item.active && styles.chipContainerActive,
          ]}
          onPress={() => {
            if (item.route) {
              router.push(item.route);
            }
          }}
        >
          <Ionicons
            name={item.icon}
            size={22}
            color={item.active ? colors.primary : "#94A3B8"}
          />
          <Text
            style={[styles.chipLabel, item.active && styles.chipLabelActive]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  contentContainer: {
    gap: 10,
    alignItems: "center",
    paddingRight: 4,
  },
  chipContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    height: 56,
    paddingHorizontal: 18,
    borderRadius: 50,
  },
  chipContainerActive: {
    backgroundColor: "#FFF5F5",
  },
  chipLabel: {
    fontSize: 24 / 2,
    fontWeight: "600",
    color: "#475569",
  },
  chipLabelActive: {
    color: colors.primary,
  },
});
