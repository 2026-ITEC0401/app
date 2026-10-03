import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Toggle } from "@/components/ui/toggle";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useAlarmSoundEnabled } from "@/hooks/use-alarm-sound-enabled";

/**
 * 알림 설정 (웹 원본 pages/NotificationSettingsPage.tsx).
 * 명세 회신: 진동 알림은 제거, 알림 소리 ON/OFF 만 기기 로컬(stores/preferences.ts)에 저장한다.
 */
export default function NotificationSettingsScreen() {
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } =
    useAlarmSoundEnabled();

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
          {/* 저장소를 읽기 전(null)에는 기본값 ON 으로 그리되 조작은 막는다 */}
          <Toggle
            checked={soundEnabled ?? true}
            disabled={soundEnabled === null}
            onChange={setSoundEnabled}
          />
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
