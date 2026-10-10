import { useState } from "react";

import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlertCard } from "@/components/alert/alert-card";
import { FullScreenAlert } from "@/components/alert/full-screen-alert";
import { EmptyHouseholdView } from "@/components/home/empty-household-view";
import { EmptyKitView } from "@/components/home/empty-kit-view";
import { NotificationBanner } from "@/components/home/notification-banner";
import { RoomCard } from "@/components/home/room-card";
import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useAlarmHistoryQuery } from "@/hooks/use-alarm-history-query";
import { useCurrentHouseholdQuery } from "@/hooks/use-current-household-query";
import { useDeviceKitQuery } from "@/hooks/use-device-kit-query";
import { useDevicesQuery } from "@/hooks/use-devices-query";
import { useHouseholdSocket } from "@/hooks/use-household-socket";
import { useUnreadCountQuery } from "@/hooks/use-unread-count-query";
import { useHouseholdId } from "@/stores/session";
import { type AlertHistoryDay, type AlertWebData } from "@/types/alert";
import { type RoomDevice } from "@/types/room";
import { toWebDataFromList } from "@/utils/alert-mapper";

const GRID_COLUMNS = 2;
/** "실시간 소리 알림"에 보여줄 최대 개수 */
const RECENT_ALERT_LIMIT = 3;

/** 웹 grid-cols-2 — RN 에는 grid 가 없어 2개씩 행으로 묶는다 */
function chunkIntoRows(devices: RoomDevice[]): RoomDevice[][] {
  const rows: RoomDevice[][] = [];
  for (let i = 0; i < devices.length; i += GRID_COLUMNS) {
    rows.push(devices.slice(i, i + GRID_COLUMNS));
  }
  return rows;
}

/** 날짜별로 묶인 이력을 최신순 한 줄로 편다 (서버 정렬에 기대지 않고 time 으로 다시 정렬) */
function flattenLatestFirst(days: AlertHistoryDay[]): AlertWebData[] {
  return days
    .flatMap((day) => day.alarms)
    .sort((a, b) => b.time.localeCompare(a.time))
    .map(toWebDataFromList);
}

/**
 * 홈 (웹 원본 pages/MainPage.tsx).
 * 기기 목록 · 미확인 개수 · 최근 알림을 조회하고, 가구 소켓을 구독해
 * 실시간 알림은 목록 맨 앞 + 전체 화면 팝업으로, 기기 상태는 캐시 갱신으로 반영한다.
 * 최근 알림은 웹의 latest 1건 대신 7일 이력(알람 탭과 같은 캐시)에서 최신 3건을 보여준다.
 * 홈 탭은 로그인 중 항상 마운트돼 있어 소켓도 여기서만 연다 (기기 화면들은 캐시를 공유).
 */
export default function HomeScreen() {
  const householdId = useHouseholdId();
  const householdQuery = useCurrentHouseholdQuery();
  const kitQuery = useDeviceKitQuery(householdId);
  const devicesQuery = useDevicesQuery(householdId);
  const unreadQuery = useUnreadCountQuery(householdId);
  const historyQuery = useAlarmHistoryQuery(householdId);

  // 실시간(WS)으로 받은 알림. 최신순으로 앞에 쌓인다.
  const [realtimeAlerts, setRealtimeAlerts] = useState<AlertWebData[]>([]);
  const [currentAlert, setCurrentAlert] = useState<AlertWebData | null>(null);

  useHouseholdSocket(householdId, {
    onAlarm: (alert) => {
      setCurrentAlert(alert);
      setRealtimeAlerts((prev) =>
        prev.some((a) => a.id === alert.id) ? prev : [alert, ...prev],
      );
    },
  });

  // 가구 · 키트 상태를 확인하기 전에는 빈 상태 카드가 깜빡이지 않도록 바탕만 그린다 (웹은 null)
  if (householdQuery.isLoading || kitQuery.isLoading) {
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
  // 키트 미등록 — 보여줄 기기 연결 상태가 없으므로 등록 안내 카드만 (조회 실패 · 기존 가구는 평소 홈)
  if (householdId && kitQuery.data?.status === "unregistered") {
    return <EmptyKitView householdId={householdId} />;
  }

  const deviceRows = chunkIntoRows(devicesQuery.data?.devices ?? []);
  const unreadCount = unreadQuery.data?.unread_count ?? 0;

  // 실시간 알림이 앞, 서버 이력이 뒤. 같은 알림이 둘 다에 있으면 한 번만. 최신 3건까지.
  const historyAlerts = flattenLatestFirst(historyQuery.data?.days ?? []);
  const alertList = [
    ...realtimeAlerts,
    ...historyAlerts.filter(
      (alert) => !realtimeAlerts.some((a) => a.id === alert.id),
    ),
  ].slice(0, RECENT_ALERT_LIMIT);

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
