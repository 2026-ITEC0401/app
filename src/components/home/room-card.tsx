import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { roomImages } from "@/constants/room";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import {
  type DeviceId,
  type DeviceUiStatus,
  type RoomLabel,
} from "@/types/room";

/** 웹 h-25 */
const IMAGE_BOX_HEIGHT = 100;
/** 웹 h-3 w-3 / mr-2.5 */
const DOT_SIZE = 12;
const DOT_GAP = 10;

export type RoomCardProps = {
  device_id: DeviceId;
  location: RoomLabel;
  ui_status: DeviceUiStatus;
};

/** 홈 "기기 연결 상태" 방 카드 (웹 원본 components/Room.tsx). 누르면 기기 상세로. */
export function RoomCard({ device_id, location, ui_status }: RoomCardProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/settings/device/[id]",
          params: { id: device_id },
        })
      }
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.imageBox}>
        <Image
          source={roomImages[location]}
          style={styles.image}
          contentFit="contain"
          accessibilityLabel={`${location} 아이콘`}
        />
      </View>
      <View style={styles.labelRow}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor:
                ui_status === "connected" ? Palette.success : Palette.gray[200],
            },
          ]}
        />
        <ThemedText type="head03" color={Palette.black}>
          {location}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: Spacing.two,
    borderRadius: Radius.xxlarge,
    backgroundColor: Palette.white,
    padding: Spacing.four,
    ...Shadow.shadow02,
  },
  cardPressed: {
    opacity: 0.85,
  },
  imageBox: {
    height: IMAGE_BOX_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DOT_GAP,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Radius.pill,
  },
});
