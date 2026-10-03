import { useEffect, useState } from "react";

import { Image } from "expo-image";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Vibration,
  View,
  type ImageSourcePropType,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing, Typography } from "@/constants/theme";
import { type AlertType, type AlertWebData } from "@/types/alert";

type PopupConfig = {
  backgroundColor: string;
  iconBackgroundColor: string;
  infoBackgroundColor: string;
  textColor: string;
  title: string;
  icon: ImageSourcePropType;
  vibratePattern: number[];
};

const ALERT_POPUP_CONFIG: Record<AlertType, PopupConfig> = {
  Urgent: {
    backgroundColor: Palette.red[200],
    iconBackgroundColor: Palette.red[100],
    infoBackgroundColor: Palette.red[300],
    textColor: Palette.red[200],
    title: "화재 경보기 울림",
    icon: require("@/assets/images/icon-emergency.png"),
    vibratePattern: [500, 200, 500, 200, 500],
  },
  Visitor: {
    backgroundColor: Palette.blue[200],
    iconBackgroundColor: Palette.blue[100],
    infoBackgroundColor: Palette.blue[300],
    textColor: Palette.blue[200],
    title: "도어락 열림",
    icon: require("@/assets/images/icon-visitor.png"),
    vibratePattern: [200, 100, 200],
  },
  Noise: {
    backgroundColor: Palette.yellow[200],
    iconBackgroundColor: Palette.yellow[100],
    infoBackgroundColor: Palette.yellow[300],
    textColor: Palette.yellow[200],
    title: "아기 울음 소리",
    icon: require("@/assets/images/icon-noise.png"),
    vibratePattern: [300],
  },
};

/** 웹 h-60 w-60 / size-48 */
const ICON_CIRCLE_SIZE = 240;
const ICON_SIZE = 192;
/** 웹 py-[1.7rem] / py-[1.6rem] (16px 기준) */
const INFO_PADDING_VERTICAL = 27;
const CLOSE_PADDING_VERTICAL = 26;
/** 웹 tracking-wider = 0.05em (alert01 50px 기준) */
const TITLE_LETTER_SPACING = Typography.alert01.fontSize * 0.05;
/** 웹 animate-text-blink: 0.8s 주기로 opacity 1 ↔ 0.3 */
const BLINK_DURATION = 400;
const BLINK_MIN_OPACITY = 0.3;

export type FullScreenAlertProps = {
  alertData?: AlertWebData;
  onClose: () => void;
};

/**
 * 실시간 알림 전체 화면 팝업 (웹 원본 components/FullScreenAlert.tsx).
 * Modal 이라 탭바까지 덮는다. 웹의 navigator.vibrate 는 RN Vibration 으로 대체.
 */
export function FullScreenAlert({ alertData, onClose }: FullScreenAlertProps) {
  const { type, sound, location, display_time } = alertData ?? {};
  // type에 맞는 설정이 없으면 렌더링하지 않는다
  const config = type ? ALERT_POPUP_CONFIG[type] : undefined;

  useEffect(() => {
    if (!config) return;

    Vibration.vibrate(config.vibratePattern);
    return () => {
      // 언마운트 시 진동 중지
      Vibration.cancel();
    };
  }, [config]);

  if (!alertData || !config) return null;

  return (
    <Modal
      visible
      transparent={false}
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={[styles.screen, { backgroundColor: config.backgroundColor }]}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: config.iconBackgroundColor },
            ]}
          >
            <Image
              source={config.icon}
              style={styles.icon}
              contentFit="contain"
              accessibilityLabel={`${config.title} 아이콘`}
            />
          </View>

          <BlinkingText>{sound} 감지</BlinkingText>
          <ThemedText type="head01" color={Palette.white} style={styles.title}>
            {config.title}
          </ThemedText>

          <View
            style={[
              styles.info,
              { backgroundColor: config.infoBackgroundColor },
            ]}
          >
            <ThemedText type="head01" color={Palette.white}>
              {location} / {display_time}
            </ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <ThemedText type="head01" color={config.textColor}>
              확인 및 닫기
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** 웹 .animate-text-blink */
function BlinkingText({ children }: { children: React.ReactNode }) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: BLINK_MIN_OPACITY,
          duration: BLINK_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: BLINK_DURATION,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.Text style={[styles.blink, { opacity }]}>
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
    padding: Spacing.nine,
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.four,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  blink: {
    ...Typography.alert01,
    color: Palette.white,
    letterSpacing: TITLE_LETTER_SPACING,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.six,
  },
  info: {
    width: "100%",
    alignItems: "center",
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.seven - Spacing.one,
    paddingVertical: INFO_PADDING_VERTICAL,
    marginBottom: Spacing.six,
  },
  closeButton: {
    width: "100%",
    alignItems: "center",
    borderRadius: Radius.pill,
    backgroundColor: Palette.white,
    paddingVertical: CLOSE_PADDING_VERTICAL,
    // 웹 shadow-[0_10px_25px_rgba(0,0,0,0.1)] — 토큰에 없는 1회성 그림자
    boxShadow: "0px 10px 25px 0px rgba(0, 0, 0, 0.1)",
  },
  closeButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
});
