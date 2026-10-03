import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Palette, Spacing } from "@/constants/theme";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { ScreenHeader } from "./ui/screen-header";

/**
 * 라우팅만 먼저 뚫어두기 위한 임시 화면.
 * 실제 UI를 붙이면서 하나씩 지워나갈 용도이므로, 여기에 로직을 추가하지 말 것.
 */
export function ScreenStub({
  name,
  detail,
  headerTitle,
}: {
  name: string;
  detail?: string;
  /** 주면 뒤로가기 헤더를 단다 (스택 화면용) */
  headerTitle?: string;
}) {
  return (
    <SafeAreaView style={styles.screen}>
      {headerTitle ? <ScreenHeader title={headerTitle} /> : null}
      <ThemedView style={styles.container}>
        <ThemedText type="head02">{name}</ThemedText>
        {detail ? (
          <ThemedText type="label03" color={Palette.gray[300]}>
            {detail}
          </ThemedText>
        ) : null}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.six,
  },
});
