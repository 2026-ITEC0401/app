import { useState } from "react";

import { ChevronRight } from "lucide-react-native";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TermsModal } from "@/components/ui/terms-modal";
import {
  OSS_LICENSES,
  type OssLicense,
} from "@/constants/oss-licenses.generated";
import { Palette, Radius, Spacing } from "@/constants/theme";

const CHEVRON_SIZE = 18;

/**
 * 오픈소스 라이선스 고지 (설정 › 오픈소스 라이선스. C 레퍼런스 app/my/licenses.tsx).
 *
 * 목록은 scripts/generate-licenses.mjs 가 package.json dependencies 에서 자동 생성한 데이터를
 * 그대로 렌더한다 (`npm run licenses:generate`). 항목을 탭하면 라이선스 전문을 TermsModal 로 띄운다.
 */
export default function LicensesScreen() {
  const [selected, setSelected] = useState<OssLicense | null>(null);

  const modalBody = selected
    ? (selected.licenseText ??
      `라이선스: ${selected.license}\n\n` +
        "이 패키지에는 라이선스 전문 파일이 포함되어 있지 않습니다. " +
        "라이선스 종류는 위와 같습니다.")
    : "";

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="오픈소스 라이선스" />

      <FlatList
        data={OSS_LICENSES}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ThemedText
            type="body02"
            color={Palette.gray[300]}
            style={styles.notice}
          >
            이 앱은 아래 오픈소스 소프트웨어를 사용합니다. 항목을 누르면
            라이선스 전문을 볼 수 있어요.
          </ThemedText>
        }
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name} 라이선스 보기`}
            onPress={() => setSelected(item)}
            style={({ pressed }) => [
              styles.row,
              index === 0 && styles.rowFirst,
              index === OSS_LICENSES.length - 1 && styles.rowLast,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.rowText}>
              <ThemedText
                type="label01"
                color={Palette.gray[600]}
                numberOfLines={1}
              >
                {item.name}
              </ThemedText>
              <ThemedText type="body03" color={Palette.gray[300]}>
                {item.version} · {item.license}
              </ThemedText>
            </View>
            <ChevronRight size={CHEVRON_SIZE} color={Palette.gray[200]} />
          </Pressable>
        )}
      />

      <TermsModal
        visible={selected !== null}
        title={selected?.name ?? ""}
        caption={selected ? `${selected.version} · ${selected.license}` : ""}
        body={modalBody}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  notice: {
    marginBottom: Spacing.four,
  },
  // 목록 전체가 설정 메뉴 그룹과 같은 흰 카드로 보이도록 첫/끝 행만 둥글게 (FlatList 라 카드로 감싸지 못한다)
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  rowFirst: {
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
  },
  rowLast: {
    borderBottomLeftRadius: Radius.large,
    borderBottomRightRadius: Radius.large,
  },
  rowPressed: {
    backgroundColor: Palette.gray[100],
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
  },
});
