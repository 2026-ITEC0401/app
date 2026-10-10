import { Check } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Palette, Spacing, type TypographyToken } from "@/constants/theme";

import { ThemedText } from "../themed-text";

/** 웹 h-6 w-6 rounded (= 4px — 토큰에 없는 값) */
const BOX_SIZE = 24;
const BOX_RADIUS = 4;
const BOX_BORDER_WIDTH = 2;
const CHECK_ICON_SIZE = 16;

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  /** 라벨 글꼴. 전체 동의처럼 강조할 때 subtitle 계열로 */
  labelType?: TypographyToken;
  /** 오른쪽 끝 보조 액션 (예: 약관 "보기"). 누르면 체크는 바뀌지 않는다 */
  moreLabel?: string;
  onPressMore?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * 약관 동의 체크박스 (웹 원본 pages/SignupFormPage.tsx 의 role="checkbox" 버튼).
 * 오른쪽 "보기" 액션은 C 레퍼런스 가입 화면의 약관 전문 보기 구성을 따른다.
 */
export function Checkbox({
  label,
  checked,
  onChange,
  labelType = "body02",
  moreLabel,
  onPressMore,
  style,
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={[styles.row, style]}
    >
      <View style={[styles.box, checked ? styles.boxChecked : styles.boxEmpty]}>
        {checked ? (
          <Check size={CHECK_ICON_SIZE} color={Palette.white} />
        ) : null}
      </View>
      <ThemedText
        type={labelType}
        color={Palette.gray[500]}
        style={styles.label}
      >
        {label}
      </ThemedText>
      {moreLabel && onPressMore ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} ${moreLabel}`}
          hitSlop={Spacing.two}
          onPress={onPressMore}
          style={({ pressed }) => [styles.more, pressed && styles.morePressed]}
        >
          <ThemedText
            type="label04"
            color={Palette.gray[300]}
            style={styles.moreText}
          >
            {moreLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    flexShrink: 0,
    borderRadius: BOX_RADIUS,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: Palette.gray[500],
  },
  boxEmpty: {
    borderWidth: BOX_BORDER_WIDTH,
    borderColor: Palette.gray[200],
    backgroundColor: Palette.white,
  },
  label: {
    flex: 1,
  },
  more: {
    flexShrink: 0,
  },
  morePressed: {
    opacity: 0.6,
  },
  moreText: {
    textDecorationLine: "underline",
  },
});
