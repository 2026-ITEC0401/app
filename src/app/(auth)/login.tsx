import { useState } from "react";

import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/http-error";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { HEADER_HEIGHT } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import { Palette, Spacing } from "@/constants/theme";
import { useLoginMutation } from "@/hooks/use-login-mutation";
import { resetToHome } from "@/utils/navigation";

const BACK_BUTTON_SIZE = 40;
const BACK_ICON_SIZE = 28;

/** 로그인 (웹 원본 pages/LoginPage.tsx) */
export default function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // POST /auth/login — 토큰 저장은 api/auth.ts 가 한다.
  // 미연동 계정은 토큰만 저장된 채 안내 문구를 띄운다 (웹과 동일). 다음 진입 시 홈이 초대 코드 입력을 안내한다.
  const handleSubmit = async () => {
    setError(null);
    if (!loginId || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    try {
      const res = await loginMutation.mutateAsync({
        login_id: loginId,
        password,
      });
      if (
        res.user.household_link_status !== "linked" ||
        !res.user.household_id
      ) {
        setError("가구 연동이 필요합니다. 초대 코드를 입력해 주세요.");
        return;
      }
      resetToHome();
    } catch (e) {
      setError(getApiErrorMessage(e, "알 수 없는 오류가 발생했어요."));
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
            style={styles.backButton}
          >
            <ChevronLeft size={BACK_ICON_SIZE} color={Palette.gray[500]} />
          </Pressable>
        </View>

        <ThemedText type="head01" color={Palette.gray[500]}>
          로그인
        </ThemedText>
        <ThemedText type="body01" color={Palette.gray[400]}>
          가구 현황을 확인하려면{"\n"}로그인해 주세요.
        </ThemedText>

        <View style={styles.form}>
          <TextField
            label="아이디"
            placeholder="아이디"
            value={loginId}
            onChangeText={setLoginId}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            returnKeyType="next"
          />
          <TextField
            label="비밀번호"
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>

        {error ? (
          <ThemedText type="body01" color={Palette.red[200]}>
            {error}
          </ThemedText>
        ) : null}

        <View style={styles.spacer} />

        <Button
          label="로그인"
          variant="dark"
          onPress={handleSubmit}
          loading={loginMutation.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.ten,
    gap: Spacing.six,
  },
  topBar: {
    height: HEADER_HEIGHT,
    justifyContent: "center",
  },
  // 웹 -ml-2: 아이콘을 본문 좌측선에 맞춘다
  backButton: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    marginLeft: -Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    gap: Spacing.three,
  },
  spacer: {
    flex: 1,
  },
});
