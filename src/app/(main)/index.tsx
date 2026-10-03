import { useState } from "react";

import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlertCard } from "@/components/alert/alert-card";
import { FullScreenAlert } from "@/components/alert/full-screen-alert";
import { EmptyHouseholdView } from "@/components/home/empty-household-view";
import { NotificationBanner } from "@/components/home/notification-banner";
import { RoomCard } from "@/components/home/room-card";
import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useCurrentHouseholdQuery } from "@/hooks/use-current-household-query";
import { useDevicesQuery } from "@/hooks/use-devices-query";
import { useLatestAlarmQuery } from "@/hooks/use-latest-alarm-query";
import { useUnreadCountQuery } from "@/hooks/use-unread-count-query";
import { useHouseholdId } from "@/stores/session";
import { type AlertWebData } from "@/types/alert";
import { type RoomDevice } from "@/types/room";
import { toWebDataFromList } from "@/utils/alert-mapper";

const GRID_COLUMNS = 2;

/** 웹 grid-cols-2 — RN 에는 grid 가 없어 2개씩 행으로 묶는다 */
function chunkIntoRows(devices: RoomDevice[]): RoomDevice[][] {
  const rows: RoomDevice[][] = [];
  for (let i = 0; i < devices.length; i += GRID_COLUMNS) {
    rows.push(devices.slice(i, i + GRID_COLUMNS));
  }
  return rows;
}

/**
 * 홈 (웹 원본 pages/MainPage.tsx).
 * 기기 목록 · 미확인 개수 · 최근 알림 1건을 조회해 보여준다.
 *
 * TODO: WebSocket 연동 — alarm.created 수신 시 realtimeAlerts 에 추가하고 FullScreenAlert 로 띄운다.
 */
export default function HomeScreen() {
  const householdId = useHouseholdId();
  const householdQuery = useCurrentHouseholdQuery();
  const devicesQuery = useDevicesQuery(householdId);
  const unreadQuery = useUnreadCountQuery(householdId);
  const latestQuery = useLatestAlarmQuery(householdId);

  // 실시간(WS)으로 받은 알림. 최신순으로 앞에 쌓인다.
  const [realtimeAlerts] = useState<AlertWebData[]>([]);
  const [currentAlert, setCurrentAlert] = useState<AlertWebData | null>(null);

  // 가구 상태를 확인하기 전에는 빈 상태 카드가 깜빡이지 않도록 바탕만 그린다 (웹은 null)
  if (householdQuery.isLoading) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  const household = householdQuery.data ?? null;

  // 미연동 — 가구가 없으면 초대 코드 안내만 표시
  if (household?.household_link_status === "unlinked") {
    return <EmptyHouseholdView variant="no-household" />;
  }
  // owner 인데 주소 미등록
  if (household?.onboarding?.next_action === "register_emergency_address") {
    return <EmptyHouseholdView variant="no-address" />;
  }

  const deviceRows = chunkIntoRows(devicesQuery.data?.devices ?? []);
  const unreadCount = unreadQuery.data?.unread_count ?? 0;

  // 서버의 최근 알림 1건 뒤에 실시간 알림이 앞으로 쌓인다. 같은 알림이 둘 다에 있으면 한 번만.
  const latest = latestQuery.data?.alarm
    ? toWebDataFromList(latestQuery.data.alarm)
    : null;
  const alertList =
    latest && !realtimeAlerts.some((a) => a.id === latest.id)
      ? [...realtimeAlerts, latest]
      : realtimeAlerts;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <NotificationBanner unreadCount={unreadCount} />
        </View>

        <View style={styles.sheet}>
          <View style={styles.devicesSection}>
            <ThemedText type="head01" color={Palette.gray[500]}>
              기기 연결 상태
            </ThemedText>
            <View style={styles.grid}>
              {deviceRows.map((row) => (
                <View key={row[0].device_id} style={styles.gridRow}>
                  {row.map((device) => (
                    <RoomCard
                      key={device.device_id}
                      device_id={device.device_id}
                      location={device.location}
                      ui_status={device.ui_status}
                    />
                  ))}
                  {/* 홀수 개일 때 마지막 칸을 비워 폭을 맞춘다 */}
                  {row.length < GRID_COLUMNS ? (
                    <View style={styles.gridFiller} />
                  ) : null}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.alertsSection}>
            <ThemedText type="head01" color={Palette.gray[500]}>
              실시간 소리 알림
            </ThemedText>
            <View style={styles.alertList}>
              {alertList.map((alert) => (
                <AlertCard
                  key={alert.id}
                  id={alert.id}
                  display_time={alert.display_time}
                  location={alert.location}
                  sound={alert.sound}
                  type={alert.type}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {currentAlert ? (
        <FullScreenAlert
          alertData={currentAlert}
          onClose={() => setCurrentAlert(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.gray[500],
  },
  content: {
    flexGrow: 1,
  },
  top: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  // 웹 rounded-t-4xl bg-gray-100 pt-5
  sheet: {
    flex: 1,
    borderTopLeftRadius: Radius.xxlarge,
    borderTopRightRadius: Radius.xxlarge,
    backgroundColor: Palette.background.base,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
  },
  devicesSection: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.seven - Spacing.one,
  },
  grid: {
    marginTop: Spacing.five,
    gap: Spacing.two,
  },
  gridRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  gridFiller: {
    flex: 1,
  },
  alertsSection: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two + Spacing.half,
  },
  alertList: {
    marginTop: Spacing.four,
  },
});
