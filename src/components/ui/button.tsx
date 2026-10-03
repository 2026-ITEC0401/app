import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Palette, Radius, type TypographyToken } from "@/constants/theme";

import { ThemedText } from "../themed-text";

/**
 * 웹 원본 components/Button.tsx 의 variant 4종 + `outline-gray`.
 * outline-gray 는 웹에서 모달 안에 직접 그리던 "취소/닫기" 버튼(테두리 gray-200, 글자 black).
 */
export type ButtonVariant =
  "primary" | "dark" | "outline-dark" | "outline-light" | "outline-gray";

/** large = 웹 h-14 (기본). small = 웹 모달 안의 h-12 버튼. */
export type ButtonSize = "large" | "small";

type VariantColors = {
  background: string;
  border: string;
  text: string;
  /** 비활성 배경. 웹에서는 dark 만 `disabled:bg-gray-200` 를 지정한다. */
  disabledBackground?: string;
};

const VARIANT_COLORS: Record<ButtonVariant, VariantColors> = {
  primary: {
    background: Palette.main[200],
    border: "transparent",
    text: Palette.gray[400],
  },
  dark: {
    background: Palette.gray[500],
    border: "transparent",
    text: Palette.gray[100],
    disabledBackground: Palette.gray[200],
  },
  "outline-dark": {
    background: "transparent",
    border: Palette.gray[500],
    text: Palette.gray[500],
  },
  "outline-light": {
    background: "transparent",
    border: Palette.gray[100],
    text: Palette.gray[100],
  },
  "outline-gray": {
    background: Palette.white,
    border: Palette.gray[200],
    text: Palette.black,
  },
};

const SIZE_STYLES: Record<
  ButtonSize,
  { height: number; borderRadius: number; textType: TypographyToken }
> = {
  large: { height: 56, borderRadius: Radius.medium, textType: "subtitle01" },
  small: { height: 48, borderRadius: Radius.small, textType: "label03" },
};

/** 웹에서 비활성 배경을 따로 지정하지 않은 variant 는 dim 처리로 통일 (opacity-40) */
const DISABLED_OPACITY = 0.4;

export type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  label: string;
  variant: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant,
  size = "large",
  loading = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const isInactive = disabled || loading;
  const colors = VARIANT_COLORS[variant];
  const sizeStyle = SIZE_STYLES[size];
  const backgroundColor =
    isInactive && colors.disabledBackground
      ? colors.disabledBackground
      : colors.background;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        {
          height: sizeStyle.height,
          borderRadius: sizeStyle.borderRadius,
          backgroundColor,
          borderColor: colors.border,
        },
        isInactive && !colors.disabledBackground && styles.dimmed,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <ThemedText
          type={sizeStyle.textType}
          color={colors.text}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  dimmed: {
    opacity: DISABLED_OPACITY,
  },
});
