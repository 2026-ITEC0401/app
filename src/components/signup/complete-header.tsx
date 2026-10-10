import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { HEADER_HEIGHT } from "@/components/ui/screen-header";
import { Palette, Spacing } from "@/constants/theme";

const CHECK_ICON_SIZE = 20;

export type CompleteHeaderProps = {
  onSkip: () => void;
};

/** 가입 완료 후 후속 단계(초대 코드·주소 등록)의 헤더 (웹 원본 components/CompleteHeader.tsx) */
export function CompleteHeader({ onSkip }: CompleteHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.status}>
        <Check size={CHECK_ICON_SIZE} color={Palette.success} />
        <ThemedText type="label03" color={Palette.success}>
          가입 완료
        </ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onSkip}
        hitSlop={Spacing.two}
        style={({ pressed }) => pressed && styles.skipPressed}
      >
        <ThemedText type="label03" color={Palette.gray[300]}>
          건너뛰기
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.five,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  skipPressed: {
    opacity: 0.6,
  },
});
