import { Check } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Palette, Spacing } from "@/constants/theme";

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
  style?: StyleProp<ViewStyle>;
};

/** 약관 동의 체크박스 (웹 원본 pages/SignupFormPage.tsx 의 role="checkbox" 버튼) */
export function Checkbox({ label, checked, onChange, style }: CheckboxProps) {
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
      <ThemedText type="body02" color={Palette.gray[500]} style={styles.label}>
        {label}
      </ThemedText>
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
    flexShrink: 1,
  },
});
