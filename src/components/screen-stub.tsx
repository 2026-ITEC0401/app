import { StyleSheet, Text, View } from "react-native";

import { Palette, Spacing, Typography } from "@/constants/theme";

/**
 * 라우팅만 먼저 뚫어두기 위한 임시 화면.
 * 실제 UI를 붙이면서 하나씩 지워나갈 용도이므로, 여기에 로직을 추가하지 말 것.
 *
 * TODO(3단계): ThemedText / ThemedView 생성 후 교체
 */
export function ScreenStub({
  name,
  detail,
}: {
  name: string;
  detail?: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.six,
    backgroundColor: Palette.background.base,
  },
  title: {
    ...Typography.head02,
    color: Palette.gray[500],
  },
  detail: {
    ...Typography.label03,
    color: Palette.gray[300],
  },
});
