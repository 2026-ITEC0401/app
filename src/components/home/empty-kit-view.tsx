import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DeviceKitStatusCard } from "@/components/device-kit/device-kit-status-card";
import { Palette, Spacing } from "@/constants/theme";

export type EmptyKitViewProps = {
  householdId: string;
};

/**
 * 홈의 키트 미등록 상태. 기기 연결 카드와 알림 목록 대신 키트 등록 카드(기기 관리 상단과 같은 것)만
 * 보여준다. 배경은 가구 미연동 화면과 같고 카드는 세로 가운데에 둔다.
 */
export function EmptyKitView({ householdId }: EmptyKitViewProps) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* 홈의 어두운 바탕과 달리 밝은 바탕이라 상태바도 dark 로 */}
      <StatusBar style="dark" />
      <DeviceKitStatusCard householdId={householdId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
    justifyContent: "center",
    paddingHorizontal: Spacing.five,
  },
});
