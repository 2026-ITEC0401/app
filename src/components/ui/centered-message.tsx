import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { Palette, Spacing } from "@/constants/theme";

import { ThemedText } from "../themed-text";

export type CenteredMessageProps = {
  children: string;
  tone?: "error";
  /**
   * true 면 화면 전체를 차지하지 않고 본문 흐름 안에 위아래 여백만 두고 놓인다
   * (웹 원본 DeviceList · FamilySettings · Profile 의 `py-10 text-center text-body-02`).
   */
  inline?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * 가운데 안내 문구 (웹 원본 AlertsPage · AlertInfoPage 의 Centered / Fallback).
 * 로딩 중 · 비어 있음 · 에러 상태에 쓴다.
 */
export function CenteredMessage({
  children,
  tone,
  inline = false,
  style,
}: CenteredMessageProps) {
  return (
    <View style={[styles.container, inline && styles.inline, style]}>
      <ThemedText
        type={inline ? "body02" : "body01"}
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
  inline: {
    flex: 0,
    paddingVertical: Spacing.eight,
  },
  text: {
    textAlign: "center",
  },
});
