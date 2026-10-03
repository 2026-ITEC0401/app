import { useState } from "react";

import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
    paddingBottom: Spacing.ten,
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
});
