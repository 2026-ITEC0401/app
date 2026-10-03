import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { Palette } from "@/constants/theme";

import { ThemedText } from "../themed-text";

export type CenteredMessageProps = {
  children: string;
  tone?: "error";
  style?: StyleProp<ViewStyle>;
};

/**
 * 화면 가운데 안내 문구 (웹 원본 AlertsPage · AlertInfoPage 의 Centered / Fallback).
 * 로딩 중 · 비어 있음 · 에러 상태에 쓴다.
 */
export function CenteredMessage({
  children,
  tone,
  style,
}: CenteredMessageProps) {
  return (
    <View style={[styles.container, style]}>
      <ThemedText
        type="body01"
        color={tone === "error" ? Palette.red[200] : Palette.gray[300]}
        style={styles.text}
      >
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
  },
});
