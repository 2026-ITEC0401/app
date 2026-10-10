import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ALERT_CONFIG } from "@/constants/alert";
import { Radius, Shadow, Spacing } from "@/constants/theme";
import { type AlertWebData } from "@/types/alert";

/** 웹 rounded-[20px] — 토큰에 없는 값이라 원본 그대로 둔다 */
const ICON_WRAP_RADIUS = 20;
/** 웹 w-12 */
const ICON_SIZE = 48;

export type AlertCardProps = Pick<
  AlertWebData,
  "id" | "display_time" | "location" | "sound" | "type"
>;

/** 홈 "실시간 소리 알림" 카드 (웹 원본 components/AlertCard.tsx). 누르면 상세로. */
export function AlertCard({
  id,
  display_time,
  location,
  sound,
  type,
}: AlertCardProps) {
  const router = useRouter();
  const config = ALERT_CONFIG[type];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/alerts/[id]", params: { id } })}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: config.cardBackground },
        pressed && styles.cardPressed,
      ]}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: config.iconBackground }]}
      >
        <Image
          source={config.icon}
          style={styles.icon}
          contentFit="contain"
          accessibilityLabel={`${sound} 아이콘`}
        />
      </View>
      <View style={styles.text}>
        <ThemedText type="head03" color={config.titleColor}>
          {sound} 감지
        </ThemedText>
        <ThemedText type="body01" color={config.subtitleColor}>
          {display_time} {location}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.five,
    borderRadius: Radius.xlarge,
    padding: Spacing.five,
    marginVertical: Spacing.two,
    ...Shadow.shadow02,
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: ICON_WRAP_RADIUS,
    padding: Spacing.two,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  text: {
    flex: 1,
  },
});
