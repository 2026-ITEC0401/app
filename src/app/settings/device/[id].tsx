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
import { showToast } from "@/stores/toast";

const TITLE = "상세 보기";
/** 웹 h-50 w-50 / border-8 / 이미지 h-24 w-24 */
const CIRCLE_SIZE = 200;
const CIRCLE_BORDER_WIDTH = 8;
const IMAGE_SIZE = 96;
const LED_PENDING_NOTICE =
  "LED 설정을 반영하는 중이에요.\n잠시 후 다시 확인해 주세요.";

/**
 * 기기 상세 (웹 원본 pages/DeviceSettingPage.tsx).
 * 단건 조회 API 가 없어 GET /devices 목록에서 대상 기기를 추출한다.
 * 토글은 PATCH connection / settings 후 서버 상태로 재확정한다 (낙관적 업데이트 배제).
 * 실시간 상태(device.status_changed)는 홈이 연 소켓이 기기 목록 캐시에 써넣으므로 여기선 구독만 한다.
 * 결과 안내(반영 중 · 오프라인 · 실패)는 화면에 남기지 않고 토스트로 잠깐 띄운다.
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
  // 허브(Raspberry Pi)는 나머지 기기의 통로라 연결을 끌 수 없다 → 토글을 잠근다
  const isHub = device.device_type === "hub";

  // 변경 후 서버 상태로 재확정 (응답 스키마 미정의 대응)
  const refetchDevice = async () => {
    const res = await devicesQuery.refetch();
    return res.data?.devices.find((d) => d.device_id === id) ?? null;
  };

  const toggleConnection = async (next: boolean) => {
    setPending("connection");
    try {
      await setConnectionMutation.mutateAsync({
        householdId,
        deviceId: device.device_id,
        enabled: next,
      });
      const updated = await refetchDevice();
      // 켜기 요청이 성공했어도 기기가 heartbeat 를 안 보내면 상태가 그대로다 → 이유 안내
      const notice = next && updated && reconnectNotice[updated.ui_status];
      if (notice) showToast(notice);
    } catch (e) {
      showToast(getApiErrorMessage(e, "변경하지 못했어요."));
    } finally {
      setPending(null);
    }
  };

  const toggleLed = async (next: boolean) => {
    setPending("led");
    try {
      await setLedAlertMutation.mutateAsync({
        householdId,
        deviceId: device.device_id,
        enabled: next,
      });
      await refetchDevice();
      // 설정은 기기가 받아 적용할 때까지 반영 대기(pending)다. 재조회 시점엔 아직 connected 로 오고
      // pending 은 잠시 뒤 WS 로 들어오므로, 상태를 보지 않고 항상 반영 중임을 알린다.
      showToast(LED_PENDING_NOTICE);
    } catch (e) {
      showToast(getApiErrorMessage(e, "변경하지 못했어요."));
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
          {/* 토글은 사용자의 희망값(desired)을 보여준다. 실제 연결 상태는 위 원의 테두리 색이 맡는다.
              ui_status 를 그대로 쓰면 LED 등 설정 변경으로 잠시 pending 이 될 때마다 토글이 꺼져 보인다.
              OFF 에서 켜면 enabled=true 로 재연결 요청 */}
          <SettingRow label="기기 연결 상태">
            <Toggle
              checked={device.desired_mqtt_connected}
              disabled={!isOwner || isHub || pending !== null}
              loading={pending === "connection"}
              onChange={toggleConnection}
            />
          </SettingRow>

          {/* LED 스위치는 지원 기기(ESP32)에만. 허브(Raspberry Pi)는 LED 가 없어 서버도 409 를 준다 */}
          {device.led_alert_control_supported ? (
            <SettingRow label="LED 알림">
              <Toggle
                checked={device.led_alert_enabled}
                disabled={!isOwner || pending !== null}
                loading={pending === "led"}
                onChange={toggleLed}
              />
            </SettingRow>
          ) : null}

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
