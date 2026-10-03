import { useRouter, type Href } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { Palette, Spacing } from "@/constants/theme";

import { ThemedText } from "../themed-text";

const CHEVRON_SIZE = 20;
/** 웹 py-4.5 */
const ROW_PADDING_VERTICAL = 18;

export type MenuRowProps = {
  label: string;
  /** 오른쪽 보조 텍스트 (예: "소리 켬", "3대 중 2대 연결") */
  value?: string;
  href: Href;
};

/**
 * 설정 메뉴 한 줄 (웹 원본 pages/SettingsPage.tsx 의 MenuRow). 누르면 href 로 이동.
 *
 * `<Link asChild>` 는 Pressable 의 함수형 style 을 넘겨주지 못해 레이아웃이 깨지므로
 * router.push 로 직접 이동한다.
 */
export function MenuRow({ label, value, href }: MenuRowProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <ThemedText type="label01" color={Palette.gray[600]}>
        {label}
      </ThemedText>
      <View style={styles.right}>
        {value ? (
          <ThemedText type="body02" color={Palette.gray[300]}>
            {value}
          </ThemedText>
        ) : null}
        <ChevronRight size={CHEVRON_SIZE} color={Palette.gray[200]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.five,
    paddingVertical: ROW_PADDING_VERTICAL,
  },
  // 웹의 hover:bg-gray-100
  rowPressed: {
    backgroundColor: Palette.gray[100],
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
});
