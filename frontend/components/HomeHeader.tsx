import React from "react";
import { StyleSheet, Text, View } from "react-native";
import tw from "twrnc";

export default function HomeHeader() {
  return (
    <View style={styles.container}>
      <Text style={[styles.goodMorning, tw`text-gray-500`]}>GOOD MORNING</Text>
      <Text style={styles.phuong}>Phuong</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  goodMorning: {
    // font inter
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "600",
  },
  phuong: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "600",
    color: "black",
  },
});
