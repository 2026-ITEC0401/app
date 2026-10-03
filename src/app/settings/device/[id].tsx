import { useState, type ReactNode } from "react";

import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/http-error";
import { ThemedText } from "@/components/themed-text";
import { CenteredMessage } from "@/components/ui/centered-message";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Toggle } from "@/components/ui/toggle";
import { reconnectNotice, roomImages } from "@/constants/room";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useCurrentHouseholdQuery } from "@/hooks/use-current-household-query";
import { useDevicesQuery } from "@/hooks/use-devices-query";
import { useSetConnectionMutation } from "@/hooks/use-set-connection-mutation";
import { useSetLedAlertMutation } from "@/hooks/use-set-led-alert-mutation";
import { useHouseholdId } from "@/stores/session";

const TITLE = "상세 보기";
/** 웹 h-50 w-50 / border-8 / 이미지 h-24 w-24 */
const CIRCLE_SIZE = 200;
const CIRCLE_BORDER_WIDTH = 8;
const IMAGE_SIZE = 96;

/**
 * 기기 상세 (웹 원본 pages/DeviceSettingPage.tsx).
 * 단건 조회 API 가 없어 GET /devices 목록에서 대상 기기를 추출한다.
 * 토글은 PATCH connection / settings 후 서버 상태로 재확정한다 (낙관적 업데이트 배제).
 *
 * TODO: WebSocket 연동 — device.status_changed 실시간 반영.
 */
export default function DeviceSettingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const householdId = useHouseholdId();
  const { isOwner } = useCurrentHouseholdQuery();
  const devicesQuery = useDevicesQuery(householdId);
  const setConnectionMutation = useSetConnectionMutation();
  const setLedAlertMutation = useSetLedAlertMutation();

  // 어떤 토글이 서버 응답 대기 중인지 (낙관적 업데이트 대신 진행 표시)
  const [pending, setPending] = useState<"connection" | "led" | null>(null);
  // 연결 켜기 요청은 성공했지만 기기가 여전히 connected 가 아닐 때의 안내
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const device =
    devicesQuery.data?.devices.find((d) => d.device_id === id) ?? null;

  if (!householdId) {
    return <Fallback>가구 연동이 필요합니다.</Fallback>;
  }
  if (devicesQuery.isLoading) {
    return <Fallback>불러오는 중…</Fallback>;
  }
  if (devicesQuery.isError) {
    return (
      <Fallback tone="error">
        {getApiErrorMessage(devicesQuery.error, "기기를 불러오지 못했어요.")}
      </Fallback>
    );
  }
  if (!device) {
    return <Fallback>기기를 찾을 수 없어요.</Fallback>;
  }

  const isConnected = device.ui_status === "connected";

  // 변경 후 서버 상태로 재확정 (응답 스키마 미정의 대응)
  const refetchDevice = async () => {
    const res = await devicesQuery.refetch();
    return res.data?.devices.find((d) => d.device_id === id) ?? null;
  };

  const toggleConnection = async (next: boolean) => {
    setPending("connection");
    setError(null);
    setNotice(null);
    try {
      await setConnectionMutation.mutateAsync({
        householdId,
        deviceId: device.device_id,
        enabled: next,
      });
      const updated = await refetchDevice();
      // 켜기 요청이 성공했어도 기기가 heartbeat 를 안 보내면 상태가 그대로다 → 이유 안내
      if (next && updated) {
        setNotice(reconnectNotice[updated.ui_status] ?? null);
      }
    } catch (e) {
      setError(getApiErrorMessage(e, "변경하지 못했어요."));
    } finally {
      setPending(null);
    }
  };

  const toggleLed = async (next: boolean) => {
    setPending("led");
    setError(null);
    try {
      await setLedAlertMutation.mutateAsync({
        householdId,
        deviceId: device.device_id,
        enabled: next,
      });
      await refetchDevice();
    } catch (e) {
      setError(getApiErrorMessage(e, "변경하지 못했어요."));
    } finally {
      setPending(null);
    }
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
          {error ? (
            <ThemedText
              type="body03"
              color={Palette.red[200]}
              style={styles.note}
            >
              {error}
            </ThemedText>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Fallback({ children, tone }: { children: string; tone?: "error" }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={TITLE} />
      <CenteredMessage tone={tone}>{children}</CenteredMessage>
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
