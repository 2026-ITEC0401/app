import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CenteredMessage } from "@/components/ui/centered-message";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette } from "@/constants/theme";

/**
 * 소리 설정 — 웹 원본 pages/ComingSoonPage.tsx 자리표시자.
 * (웹 주석: 9월 평가 후 구현 예정)
 */
export default function SoundSettingsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="소리 설정" />
      <CenteredMessage>준비 중인 화면이에요.</CenteredMessage>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
});
