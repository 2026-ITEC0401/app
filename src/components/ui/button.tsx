import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Palette, Radius } from "@/constants/theme";

import { ThemedText } from "../themed-text";

/** 웹 원본 components/Button.tsx 의 variant 와 1:1 */
export type ButtonVariant =
  "primary" | "dark" | "outline-dark" | "outline-light";

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
};

/** 웹 h-14 */
const BUTTON_HEIGHT = 56;
/** 웹에서 비활성 배경을 따로 지정하지 않은 variant 는 dim 처리로 통일 (opacity-40) */
const DISABLED_OPACITY = 0.4;

export type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  label: string;
  variant: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant,
  loading = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const isInactive = disabled || loading;
  const colors = VARIANT_COLORS[variant];
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
        { backgroundColor, borderColor: colors.border },
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
          type="subtitle01"
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
    height: BUTTON_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  dimmed: {
    opacity: DISABLED_OPACITY,
  },
});
