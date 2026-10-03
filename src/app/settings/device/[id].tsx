import { useState, type ReactNode } from "react";

import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { CenteredMessage } from "@/components/ui/centered-message";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Toggle } from "@/components/ui/toggle";
import { reconnectNotice, roomImages } from "@/constants/room";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useCurrentHousehold } from "@/hooks/use-current-household";
import { MOCK_DEVICES } from "@/mocks/devices";
import { type RoomDevice } from "@/types/room";

const TITLE = "상세 보기";
/** 웹 h-50 w-50 / border-8 / 이미지 h-24 w-24 */
const CIRCLE_SIZE = 200;
const CIRCLE_BORDER_WIDTH = 8;
const IMAGE_SIZE = 96;
/** 토글 요청 흉내 (API 연동 전) */
const PENDING_DELAY_MS = 800;

/**
 * 기기 상세 (웹 원본 pages/DeviceSettingPage.tsx).
 *
 * TODO: API·WebSocket 연동 — GET /devices 에서 대상 기기 추출,
 * PATCH connection / led-alert 후 서버 상태로 재확정. 지금은 로컬 상태만 바꾼다.
 */
export default function DeviceSettingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOwner } = useCurrentHousehold();

  const [device, setDevice] = useState<RoomDevice | null>(
    () => MOCK_DEVICES.find((d) => d.device_id === id) ?? null,
  );
  // 어떤 토글이 서버 응답 대기 중인지 (낙관적 업데이트 대신 진행 표시)
  const [pending, setPending] = useState<"connection" | "led" | null>(null);
  // 연결 켜기 요청은 성공했지만 기기가 여전히 connected 가 아닐 때의 안내
  const [notice, setNotice] = useState<string | null>(null);

  if (!device) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScreenHeader title={TITLE} />
        <CenteredMessage>기기를 찾을 수 없어요.</CenteredMessage>
      </SafeAreaView>
    );
  }

  const isConnected = device.ui_status === "connected";

  const toggleConnection = (next: boolean) => {
    setPending("connection");
    setNotice(null);
    setTimeout(() => {
      setDevice((prev) =>
        prev
          ? {
              ...prev,
              desired_mqtt_connected: next,
              ui_status: next ? "connected" : "disabled_by_owner",
            }
          : prev,
      );
      // 켜기 요청이 성공했어도 기기가 heartbeat 를 안 보내면 상태가 그대로다 → 이유 안내
      if (next && device.ui_status !== "connected") {
        setNotice(reconnectNotice[device.ui_status] ?? null);
      }
      setPending(null);
    }, PENDING_DELAY_MS);
  };

  const toggleLed = (next: boolean) => {
    setPending("led");
    setTimeout(() => {
      setDevice((prev) => (prev ? { ...prev, led_alert_enabled: next } : prev));
      setPending(null);
    }, PENDING_DELAY_MS);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={TITLE} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View
            style={[
              styles.circle,
              {
                borderColor: isConnected ? Palette.success : Palette.gray[200],
              },
            ]}
          >
            <Image
              source={roomImages[device.location]}
              style={styles.image}
              contentFit="contain"
              accessibilityLabel={`${device.location} 아이콘`}
            />
            <ThemedText type="head03" color={Palette.gray[600]}>
              {device.location}
            </ThemedText>
          </View>
        </View>

        <View style={styles.settings}>
          {/* 토글은 희망값(desired)이 아니라 실제 연결 상태(ui_status)를 표시.
              OFF 상태에서 켜면 enabled=true 로 재연결 요청 */}
          <SettingRow label="기기 연결 상태">
            <Toggle
              checked={isConnected}
              disabled={!isOwner || pending !== null}
              loading={pending === "connection"}
              onChange={toggleConnection}
            />
          </SettingRow>

          <SettingRow label="LED 알림">
            <Toggle
              checked={device.led_alert_enabled}
              disabled={!isOwner || pending !== null}
              loading={pending === "led"}
              onChange={toggleLed}
            />
          </SettingRow>

          {/* owner만 변경 가능 (§6.2·§6.3). member는 조회 전용 */}
          {!isOwner ? (
            <ThemedText
              type="body03"
              color={Palette.gray[300]}
              style={styles.note}
            >
              기기 설정은 가구 소유자만 변경할 수 있어요.
            </ThemedText>
          ) : null}
          {notice ? (
            <ThemedText
              type="body03"
              color={Palette.red[200]}
              style={styles.note}
            >
              {notice}
            </ThemedText>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <ThemedText type="subtitle02" color={Palette.gray[500]}>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    paddingBottom: Spacing.ten,
  },
  hero: {
    alignItems: "center",
    paddingVertical: Spacing.nine,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: CIRCLE_BORDER_WIDTH,
    backgroundColor: Palette.white,
    ...Shadow.shadow01,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  settings: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Radius.xxlarge,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    ...Shadow.shadow02,
  },
  note: {
    paddingHorizontal: Spacing.one,
  },
});
