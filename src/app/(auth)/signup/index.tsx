import { useState } from "react";

import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LegalLinks } from "@/components/auth/legal-links";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TypeCard } from "@/components/ui/type-card";
import { Palette, Spacing } from "@/constants/theme";
import type { SignupType } from "@/types/signup";

/** 가입 유형 선택 (웹 원본 pages/SignupTypePage.tsx) */
export default function SignupTypeScreen() {
  const router = useRouter();
  const [signupType, setSignupType] = useState<SignupType | null>(null);

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="회원가입" />

      <View style={styles.content}>
        <View style={styles.titleBlock}>
          <ThemedText type="head02" color={Palette.gray[500]}>
            가입 유형 선택
          </ThemedText>
          <ThemedText type="body01" color={Palette.gray[300]}>
            어떤 방식으로 이용하시나요?
          </ThemedText>
        </View>

        <View style={styles.cards}>
          <TypeCard
            title="신규 가구 등록"
            description={
              "우리 집을 처음 등록합니다.\n센서 기기 설정을 진행해요."
            }
            isSelected={signupType === "new_household"}
            onPress={() => setSignupType("new_household")}
          />
          <TypeCard
            title="가족 · 보호자로 참여"
            description={"이미 등록된 가구에\n초대 코드로 연동합니다."}
            isSelected={signupType === "family_member"}
            onPress={() => setSignupType("family_member")}
          />
        </View>

        <View style={styles.spacer} />

        <Button
          label="다음"
          variant="dark"
          disabled={signupType === null}
          onPress={() =>
            router.push(
              signupType === "new_household" ? "/signup/new" : "/signup/family",
            )
          }
        />

        {/* 로그인 화면의 "회원가입" 과 짝. 두 화면을 서로 오갈 수 있게 한다 */}
        <View style={styles.switchRow}>
          <ThemedText type="body02" color={Palette.gray[300]}>
            이미 계정이 있으신가요?
          </ThemedText>
          <Pressable
            accessibilityRole="link"
            hitSlop={Spacing.two}
            onPress={() => router.replace("/login")}
          >
            <ThemedText
              type="label03"
              color={Palette.gray[500]}
              style={styles.switchLink}
            >
              로그인
            </ThemedText>
          </Pressable>
        </View>

        {/* 로그인 화면과 같은 약관·처리방침 링크 */}
        <LegalLinks />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
    // 하단에 전환·약관 링크 두 줄이 더 있어 다른 인증 화면(ten)보다 좁게 둔다
    paddingBottom: Spacing.six,
  },
  content: {
    flex: 1,
    gap: Spacing.six,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
  },
  titleBlock: {
    gap: Spacing.two,
  },
  cards: {
    gap: Spacing.three,
  },
  spacer: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  switchLink: {
    textDecorationLine: "underline",
  },
});
