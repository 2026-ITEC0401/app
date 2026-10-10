import { useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";

export type EmptyHouseholdVariant = "no-household" | "no-address";

const CONFIG: Record<
  EmptyHouseholdVariant,
  { title: string; description: string; buttonLabel: string; href: Href }
> = {
  "no-household": {
    title: "등록된 가구가 없습니다",
    description: "가족에게 받은 초대 코드를\n입력해 주세요.",
    buttonLabel: "초대 코드 입력",
    href: "/signup/invite",
  },
  "no-address": {
    title: "집 주소가 필요해요",
    description: "긴급 상황에 대비해\n집 주소를 등록해 주세요.",
    buttonLabel: "주소 등록",
    href: "/signup/address",
  },
};

/**
 * 홈의 빈 상태 (웹 원본 pages/MainPage.tsx 의 EmptyHouseholdView).
 * 미연동 사용자 → 초대 코드 안내, owner 인데 주소 미등록 → 주소 등록 안내.
 */
export function EmptyHouseholdView({
  variant,
}: {
  variant: EmptyHouseholdVariant;
}) {
  const router = useRouter();
  const { title, description, buttonLabel, href } = CONFIG[variant];

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* 홈의 어두운 바탕과 달리 밝은 바탕이라 상태바도 dark 로 */}
      <StatusBar style="dark" />
      <View style={styles.card}>
        <ThemedText type="head03" color={Palette.gray[500]}>
          {title}
        </ThemedText>
        <ThemedText
          type="body01"
          color={Palette.gray[300]}
          style={styles.description}
        >
          {description}
        </ThemedText>
        <Button
          label={buttonLabel}
          variant="dark"
          onPress={() => router.push(href)}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.eight,
  },
  card: {
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
    padding: Spacing.six,
    ...Shadow.shadow03,
  },
  description: {
    marginTop: Spacing.two,
  },
  button: {
    marginTop: Spacing.six,
  },
});
