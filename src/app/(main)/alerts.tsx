import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlertHistoryGroup } from "@/components/alert/alert-history-group";
import { CenteredMessage } from "@/components/ui/centered-message";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Spacing } from "@/constants/theme";
import { MOCK_ALERT_HISTORY } from "@/mocks/alerts";

/**
 * 알람 탭 (웹 원본 pages/AlertsPage.tsx).
 *
 * TODO: API 연동 — GET /alarms/history 조회 성공 시 PATCH /alarms/seen 으로 모두 확인 처리.
 * 미연동 · 로딩 · 에러 상태는 CenteredMessage 로 표시한다.
 */
export default function AlertsScreen() {
  // 서버는 알림이 없는 날짜도 빈 배열로 내려주므로 화면에서는 제외한다
  const daysWithAlarms = MOCK_ALERT_HISTORY.days.filter(
    (day) => day.alarms.length > 0,
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScreenHeader title="알람" showBackButton={false} />

      {daysWithAlarms.length === 0 ? (
        <CenteredMessage>최근 7일 동안 받은 알림이 없어요.</CenteredMessage>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {daysWithAlarms.map((day) => (
            <AlertHistoryGroup
              key={day.date}
              date={day.date}
              display_label={day.display_label}
              alarms={day.alarms}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    gap: Spacing.six,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
  },
});
