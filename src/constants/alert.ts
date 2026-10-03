import type { ImageSourcePropType } from "react-native";

import { Palette } from "@/constants/theme";
import { type AlertType } from "@/types/alert";

interface AlertConfig {
  icon: ImageSourcePropType;
  cardBackground: string;
  iconBackground: string;
  titleColor: string;
  subtitleColor: string;
  // 알람 목록의 종류 구분 점 색상 (빨강/파랑/노랑)
  dotColor: string;
  // 상세 보기 상단 뱃지
  badgeLabel: string;
  badgeBackground: string;
}

/** 알림 종류별 표시 설정 (웹 원본 constants/alert.ts — Tailwind 클래스를 팔레트 값으로 치환) */
export const ALERT_CONFIG: Record<AlertType, AlertConfig> = {
  Urgent: {
    icon: require("@/assets/images/icon-emergency.png"),
    cardBackground: Palette.emergency[100],
    iconBackground: Palette.emergency[300],
    titleColor: Palette.white,
    subtitleColor: Palette.white,
    dotColor: Palette.red[200],
    badgeLabel: "긴급",
    badgeBackground: Palette.red[200],
  },

  Visitor: {
    icon: require("@/assets/images/icon-visitor.png"),
    cardBackground: Palette.white,
    iconBackground: Palette.blue[100],
    titleColor: Palette.gray[600],
    subtitleColor: Palette.gray[300],
    dotColor: Palette.blue[200],
    badgeLabel: "방문",
    badgeBackground: Palette.blue[200],
  },

  Noise: {
    icon: require("@/assets/images/icon-noise.png"),
    cardBackground: Palette.white,
    iconBackground: Palette.yellow[100],
    titleColor: Palette.gray[600],
    subtitleColor: Palette.gray[300],
    dotColor: Palette.yellow[200],
    badgeLabel: "소음",
    badgeBackground: Palette.yellow[200],
  },
};
