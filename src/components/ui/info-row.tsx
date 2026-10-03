import { StyleSheet, View } from "react-native";

import { Palette, Spacing } from "@/constants/theme";

import { ThemedText } from "../themed-text";

export type InfoRowProps = {
  label: string;
  value: string;
  /** 마지막 줄은 false (웹의 last:border-b-0) */
  showDivider?: boolean;
};

/** 라벨 · 값 한 줄 (웹 원본 pages/AlertInfoPage.tsx 의 InfoRow) */
export function InfoRow({ label, value, showDivider = true }: InfoRowProps) {
  return (
    <View style={[styles.row, showDivider && styles.rowDivided]}>
      <ThemedText type="subtitle02" color={Palette.gray[500]}>
        {label}
      </ThemedText>
      <ThemedText type="body01" color={Palette.gray[300]}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.five,
  },
  rowDivided: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
});
