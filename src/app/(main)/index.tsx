import { useState } from "react";

import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlertCard } from "@/components/alert/alert-card";
import { FullScreenAlert } from "@/components/alert/full-screen-alert";
import { NotificationBanner } from "@/components/home/notification-banner";
import { RoomCard } from "@/components/home/room-card";
import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { MOCK_ALERTS, MOCK_UNREAD_COUNT } from "@/mocks/alerts";
import { MOCK_DEVICES } from "@/mocks/devices";
import { type AlertWebData } from "@/types/alert";
import { type RoomDevice } from "@/types/room";

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
 *
 * TODO: API·WebSocket 연동 — 기기 목록 / 미확인 개수 / 최신 알림 조회,
 * 실시간 alarm.created 수신 시 setCurrentAlert 로 전체 화면 팝업.
 * 미연동(unlinked)·주소 미등록 분기(EmptyHouseholdView)도 그때 붙인다.
 */
export default function HomeScreen() {
  const [currentAlert, setCurrentAlert] = useState<AlertWebData | null>(null);
  const deviceRows = chunkIntoRows(MOCK_DEVICES);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <NotificationBanner unreadCount={MOCK_UNREAD_COUNT} />
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
              {MOCK_ALERTS.map((alert) => (
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
