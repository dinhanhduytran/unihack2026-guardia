import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";

interface Props {
  children: React.ReactNode;
  backgroundColor?: string;
  withHorizontalPadding?: boolean;
  safeAreaEdges?: Edge[];
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

const Container = ({
  children,
  backgroundColor = colors.cardBackground,
  withHorizontalPadding = true,
  safeAreaEdges = ["top"],
  containerStyle,
  contentStyle,
}: Props) => {
  return (
    <SafeAreaView
      edges={safeAreaEdges}
      style={[{ flex: 1, backgroundColor }, containerStyle]}
    >
      <View
        style={[
          { flex: 1 },
          withHorizontalPadding ? { paddingHorizontal: 20 } : null,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

export default Container;
