import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import {
  deviceTypeLabel,
  kitDeviceConnectionMeta,
} from "@/constants/device-kit";
import { roomImages } from "@/constants/room";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import type { DeviceType, DeviceUiStatus, RoomLabel } from "@/types/room";

/** 기기 관리 목록과 같은 크기 */
const IMAGE_SIZE = 48;
const DOT_SIZE = 10;

export type KitDeviceListItem = {
  device_id: string;
  device_type: DeviceType;
  location: RoomLabel;
  hardware_id: string | null;
  /** 결과 화면에서만 있다 (미리보기 응답에는 연결 상태가 없다) */
  ui_status?: DeviceUiStatus;
};

export type KitDeviceListProps = {
  devices: KitDeviceListItem[];
};

/**
 * 키트에 포함된 기기 4대 (허브 1 + 알림 기기 3) 목록.
 * 확인 화면(미리보기)과 결과 화면이 공유한다. 결과 화면은 ui_status 를 넘겨 연결 상태까지 보여준다.
 */
export function KitDeviceList({ devices }: KitDeviceListProps) {
  return (
    <View style={styles.card}>
      {devices.map((device, index) => {
        const connection = device.ui_status
          ? kitDeviceConnectionMeta(device.ui_status)
          : null;
        return (
          <View
            key={device.device_id}
            style={[styles.row, index > 0 && styles.rowDivided]}
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
              <ThemedText type="subtitle03" color={Palette.gray[600]}>
                {device.location}
              </ThemedText>
              <ThemedText type="body03" color={Palette.gray[300]}>
                {deviceTypeLabel[device.device_type]}
              </ThemedText>
              {device.hardware_id ? (
                <ThemedText type="body03" color={Palette.gray[300]}>
                  {device.hardware_id}
                </ThemedText>
              ) : null}
            </View>

            {connection ? (
              <View style={styles.status}>
                <View
                  style={[styles.dot, { backgroundColor: connection.dotColor }]}
                />
                <ThemedText type="body02" color={Palette.gray[400]}>
                  {connection.label}
                </ThemedText>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.four,
    ...Shadow.shadow02,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
    paddingVertical: Spacing.four,
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: Palette.border,
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
    gap: Spacing.half,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flexShrink: 0,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Radius.pill,
  },
});
