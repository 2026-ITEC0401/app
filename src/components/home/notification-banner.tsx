import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { FontFamily, Palette, Spacing } from "@/constants/theme";

const ICON = require("@/assets/images/icon-alert-on.png");

/** 웹 w-17.5 (종 이미지가 카드를 뚫고 나가지 않도록 크기를 딱 잡아둔다) */
const ICON_SIZE = 70;
/** 웹 text-[28px] leading-[1.4] — 토큰 외 1회성 크기 */
const BANNER_FONT_SIZE = 28;
const BANNER_LINE_HEIGHT = 39;

export type NotificationBannerProps = {
  unreadCount: number;
};

/**
 * 홈 상단 미확인 알림 배너 (웹 원본 components/Notification.tsx).
 * 웹의 font-light(300)/font-semibold(600)는 임베드하지 않은 굵기라 Regular/Bold 로 대체한다.
 */
export function NotificationBanner({ unreadCount }: NotificationBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        확인하지 않은{"\n"}
        <Text style={styles.textStrong}>{unreadCount}개의 알람</Text>이 있어요!
      </Text>
      <Image
        source={ICON}
        style={styles.icon}
        contentFit="contain"
        accessibilityLabel="알람 아이콘"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.three,
  },
  text: {
    fontFamily: FontFamily.regular,
    fontSize: BANNER_FONT_SIZE,
    lineHeight: BANNER_LINE_HEIGHT,
    color: Palette.white,
  },
  textStrong: {
    fontFamily: FontFamily.bold,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});
