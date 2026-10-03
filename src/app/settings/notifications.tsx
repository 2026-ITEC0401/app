import { useState } from "react";

import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Toggle } from "@/components/ui/toggle";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";

/**
 * 알림 설정 (웹 원본 pages/NotificationSettingsPage.tsx).
 * 알림 소리 ON/OFF 만 있고 서버 저장은 하지 않는다.
 *
 * TODO: 로컬 저장소 연동 — 웹은 localStorage, RN 은 expo-secure-store 등으로 영속화.
 */
export default function NotificationSettingsScreen() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="알림 설정" />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardText}>
            <ThemedText type="subtitle02" color={Palette.gray[500]}>
              알림 소리
            </ThemedText>
            <ThemedText type="body02" color={Palette.gray[300]}>
              기본 알림음 · 사이렌
            </ThemedText>
          </View>
          <Toggle checked={soundEnabled} onChange={setSoundEnabled} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    ...Shadow.shadow02,
  },
  cardText: {
    gap: Spacing.one,
  },
});
