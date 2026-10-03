import type { ViewStyle } from "react-native";

export { Palette } from "./palette";
export { FontFamily, Typography, type TypographyToken } from "./typography";

/**
 * 간격. 웹 원본은 Tailwind 4px 격자(p-1=4 … p-6=24, pt-10=40 …)를 그대로 썼다.
 * 실제로 쓰인 단계만 골라 순서대로 이름을 붙였다. (half = 0.5 단계 = 2dp)
 */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
  nine: 48,
  ten: 64,
} as const;

/** 모서리. 웹 원본의 rounded-lg / xl / 2xl / 3xl / 4xl / full 에 대응한다. */
export const Radius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
  xxlarge: 32,
  pill: 9999,
} as const;

/**
 * 그림자. 웹 원본 tokens.css 의 --shadow-01~03.
 *
 * RN 0.76+(New Architecture)는 iOS·Android 모두 CSS 문법의 `boxShadow`를
 * 지원하므로 플랫폼별 shadow* / elevation 분기 없이 웹 값을 그대로 옮긴다.
 * (elevation은 색·오프셋을 못 바꾸고, iOS shadow*는 Android에서 무시된다)
 */
export const Shadow = {
  shadow01: { boxShadow: "2px 2px 4px 0px rgba(0, 0, 0, 0.25)" },
  shadow02: { boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.2)" },
  shadow03: { boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.08)" },
} as const satisfies Record<string, ViewStyle>;
