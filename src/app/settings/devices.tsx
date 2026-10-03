import { useState } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/http-error";
import { ThemedText } from "@/components/themed-text";
import { CenteredMessage } from "@/components/ui/centered-message";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  deviceStatusMeta,
  reconnectNotice,
  roomImages,
} from "@/constants/room";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useCurrentHouseholdQuery } from "@/hooks/use-current-household-query";
import { useDevicesQuery } from "@/hooks/use-devices-query";
import { useSetConnectionMutation } from "@/hooks/use-set-connection-mutation";
import { useHouseholdId } from "@/stores/session";
import { type RoomDevice } from "@/types/room";

/** 웹 h-12 w-12 */
const IMAGE_SIZE = 48;
const DOT_SIZE = 10;
const CHEVRON_SIZE = 22;
const DISABLED_OPACITY = 0.4;

/**
 * 기기 관리 (웹 원본 pages/DeviceListPage.tsx).
 * GET /devices 목록 + owner 의 재연결(PATCH connection).
 *
 * TODO: WebSocket 연동 — device.status_changed 실시간 반영.
 */
export default function DeviceListScreen() {
  const householdId = useHouseholdId();
  const { isOwner } = useCurrentHouseholdQuery();
  const devicesQuery = useDevicesQuery(householdId);
  const setConnectionMutation = useSetConnectionMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  // 재연결 요청은 성공했지만 기기가 여전히 connected 가 아닐 때의 안내 (기기별).
  // 요청 실패 문구도 같은 자리에 보여준다 (웹은 목록 전체를 에러로 바꿨다).
  const [notice, setNotice] = useState<{ id: string; text: string } | null>(
    null,
  );

  // 응답 스키마 미정의 → 성공 후 재조회로 상태 확정 (WS로도 정합)
  const reconnect = async (device: RoomDevice) => {
    if (!householdId) return;
    setBusyId(device.device_id);
    setNotice(null);
    try {
      await setConnectionMutation.mutateAsync({
        householdId,
        deviceId: device.device_id,
        enabled: true,
      });
      const res = await devicesQuery.refetch();
      // 요청은 성공했어도 기기가 heartbeat 를 안 보내면 상태가 그대로다 → 이유 안내
      const target = res.data?.devices.find(
        (d) => d.device_id === device.device_id,
      );
      const text = target && reconnectNotice[target.ui_status];
      if (text) setNotice({ id: device.device_id, text });
    } catch (e) {
      setNotice({
        id: device.device_id,
        text: getApiErrorMessage(e, "재연결하지 못했어요."),
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="기기 관리" />

      {!householdId ? (
        <CenteredMessage inline>가구 연동이 필요합니다.</CenteredMessage>
      ) : devicesQuery.isLoading ? (
        <CenteredMessage inline>불러오는 중…</CenteredMessage>
      ) : devicesQuery.isError ? (
        <CenteredMessage inline tone="error">
          {getApiErrorMessage(devicesQuery.error, "기기를 불러오지 못했어요.")}
        </CenteredMessage>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {(devicesQuery.data?.devices ?? []).map((device) => (
            <DeviceRow
              key={device.device_id}
              device={device}
              canControl={isOwner}
              busy={busyId === device.device_id}
              notice={notice?.id === device.device_id ? notice.text : null}
              onReconnect={() => reconnect(device)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

interface DeviceRowProps {
  device: RoomDevice;
  canControl: boolean;
  busy: boolean;
  notice: string | null;
  onReconnect: () => void;
}

function DeviceRow({
  device,
  canControl,
  busy,
  notice,
  onReconnect,
}: DeviceRowProps) {
  const router = useRouter();
  const status = deviceStatusMeta[device.ui_status];
  const isConnected = device.ui_status === "connected";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/settings/device/[id]",
          params: { id: device.device_id },
        })
      }
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.imageBox}>
        <Image
          source={roomImages[device.location]}
          style={styles.image}
          contentFit="contain"
          accessibilityLabel={`${device.location} 아이콘`}
        />
      </View>

      <View style={styles.text}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: status.dotColor }]} />
          <ThemedText type="subtitle03" color={Palette.gray[600]}>
            {device.location}
          </ThemedText>
        </View>
        <ThemedText type="body02" color={Palette.gray[300]}>
          {status.label}
        </ThemedText>
        {notice ? (
          <ThemedText type="body03" color={Palette.red[200]}>
            {notice}
          </ThemedText>
        ) : null}
      </View>

      {/* 재연결은 owner 전용. member는 조회만 (버튼 숨김) */}
      {isConnected || !canControl ? (
        <ChevronRight size={CHEVRON_SIZE} color={Palette.gray[200]} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={onReconnect}
          style={[styles.reconnectButton, busy && styles.reconnectButtonBusy]}
        >
          <ThemedText type="label05" color={Palette.gray[400]}>
            {busy ? "연결 중…" : "재연결"}
          </ThemedText>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    ...Shadow.shadow02,
  },
  rowPressed: {
    backgroundColor: Palette.gray[100],
  },
  imageBox: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    flexShrink: 0,
    borderRadius: Radius.pill,
  },
  reconnectButton: {
    flexShrink: 0,
    borderRadius: Radius.small,
    backgroundColor: Palette.gray[100],
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  reconnectButtonBusy: {
    opacity: DISABLED_OPACITY,
  },
});
