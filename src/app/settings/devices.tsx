import { useState } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  deviceStatusMeta,
  reconnectNotice,
  roomImages,
} from "@/constants/room";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useCurrentHousehold } from "@/hooks/use-current-household";
import { MOCK_DEVICES } from "@/mocks/devices";
import { type RoomDevice } from "@/types/room";

/** 웹 h-12 w-12 */
const IMAGE_SIZE = 48;
const DOT_SIZE = 10;
const CHEVRON_SIZE = 22;
const DISABLED_OPACITY = 0.4;
/** 재연결 요청 흉내 (API 연동 전) */
const RECONNECT_DELAY_MS = 800;

/**
 * 기기 관리 (웹 원본 pages/DeviceListPage.tsx).
 *
 * TODO: API·WebSocket 연동 — GET /devices, PATCH /devices/{id}/connection,
 * device.status_changed 실시간 반영. 지금은 목 목록 + 재연결 요청 흉내.
 */
export default function DeviceListScreen() {
  const { isOwner } = useCurrentHousehold();
  const [devices] = useState<RoomDevice[]>(MOCK_DEVICES);
  const [busyId, setBusyId] = useState<string | null>(null);
  // 재연결 요청은 성공했지만 기기가 여전히 connected 가 아닐 때의 안내 (기기별)
  const [notice, setNotice] = useState<{ id: string; text: string } | null>(
    null,
  );

  const reconnect = (device: RoomDevice) => {
    setBusyId(device.device_id);
    setNotice(null);
    setTimeout(() => {
      const text = reconnectNotice[device.ui_status];
      if (text) setNotice({ id: device.device_id, text });
      setBusyId(null);
    }, RECONNECT_DELAY_MS);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="기기 관리" />

      <ScrollView contentContainerStyle={styles.content}>
        {devices.map((device) => (
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
