import { useState } from "react";

import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { TermContentModal } from "@/components/ui/term-content-modal";
import type { TermContentCode } from "@/constants/terms";
import { Palette, Spacing } from "@/constants/theme";

const LINKS: { code: TermContentCode; label: string }[] = [
  { code: "TERMS_OF_SERVICE", label: "서비스 이용약관" },
  { code: "PRIVACY_POLICY", label: "개인정보 처리방침" },
];

/**
 * 로그인 전 화면 하단의 "서비스 이용약관 · 개인정보 처리방침" 링크 줄.
 * 로그인·가입 유형 선택 화면이 공유한다 (C 레퍼런스 login/signup 하단의 처리방침 링크 구성).
 * 전문 모달 상태까지 안에서 들고 있어 화면은 한 줄만 놓으면 된다.
 */
export function LegalLinks() {
  const [termModal, setTermModal] = useState<TermContentCode | null>(null);

  return (
    <>
      <View style={styles.row}>
        {LINKS.map((item, index) => (
          <View key={item.code} style={styles.item}>
            {index > 0 ? (
              <ThemedText type="body03" color={Palette.gray[200]}>
                ·
              </ThemedText>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.label} 보기`}
              hitSlop={Spacing.two}
              onPress={() => setTermModal(item.code)}
            >
              <ThemedText type="body03" color={Palette.gray[300]}>
                {item.label}
              </ThemedText>
            </Pressable>
          </View>
        ))}
      </View>

      <TermContentModal code={termModal} onClose={() => setTermModal(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  // 바로 위 "회원가입 / 로그인" 전환 줄에 붙도록 부모 gap 을 상쇄한다
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    marginTop: -Spacing.three,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});
