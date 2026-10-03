import { useState } from "react";

import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { HEADER_HEIGHT } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import { Palette, Spacing } from "@/constants/theme";

const BACK_BUTTON_SIZE = 40;
const BACK_ICON_SIZE = 28;

/** 로그인 (웹 원본 pages/LoginPage.tsx) */
export default function LoginScreen() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // TODO: 인증 API 연동 (POST /auth/login) — 토큰 저장 후 가구 연동 상태에 따라 분기.
  // 지금은 골격만: 입력이 비면 에러, 아니면 홈으로.
  const handleSubmit = () => {
    setError(null);
    if (!loginId || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    router.replace("/");
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
          disabled={loading}
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
