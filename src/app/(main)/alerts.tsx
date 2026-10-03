import { useCallback } from "react";

import { useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/http-error";
import { AlertHistoryGroup } from "@/components/alert/alert-history-group";
import { CenteredMessage } from "@/components/ui/centered-message";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Spacing } from "@/constants/theme";
import { useAlarmHistoryQuery } from "@/hooks/use-alarm-history-query";
import { useMarkAlarmsSeenMutation } from "@/hooks/use-mark-alarms-seen-mutation";
import { useHouseholdId } from "@/stores/session";

/**
 * 알람 탭 (웹 원본 pages/AlertsPage.tsx).
 * 이력 조회에 성공하면 = 알림 목록을 확인한 것 → 모두 확인 처리해 홈 배지를 0 으로 만든다.
 */
export default function AlertsScreen() {
  const householdId = useHouseholdId();
  const historyQuery = useAlarmHistoryQuery(householdId);
  const { refetch } = historyQuery;
  const { mutate: markSeen } = useMarkAlarmsSeenMutation();

  // 탭 화면은 마운트가 유지되므로(웹은 라우트 이동마다 새로 마운트) 포커스될 때마다 재조회한다.
  useFocusEffect(
    useCallback(() => {
      if (!householdId) return;
      refetch().then((res) => {
        if (res.isSuccess) markSeen(householdId);
      });
    }, [householdId, refetch, markSeen]),
  );

  // 서버는 알림이 없는 날짜도 빈 배열로 내려주므로 화면에서는 제외한다
  const daysWithAlarms =
    historyQuery.data?.days.filter((day) => day.alarms.length > 0) ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScreenHeader title="알람" showBackButton={false} />

      {!householdId ? (
        <CenteredMessage>가구 연동이 필요합니다.</CenteredMessage>
      ) : historyQuery.isLoading ? (
        <CenteredMessage>불러오는 중…</CenteredMessage>
      ) : historyQuery.isError ? (
        <CenteredMessage tone="error">
          {getApiErrorMessage(historyQuery.error, "알림을 불러오지 못했어요.")}
        </CenteredMessage>
      ) : daysWithAlarms.length === 0 ? (
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
