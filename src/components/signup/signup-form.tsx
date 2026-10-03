import { useState } from "react";

import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/http-error";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useSignupMutation } from "@/hooks/use-signup-mutation";
import type { SignupType } from "@/types/signup";

export type SignupFormProps = {
  signupType: SignupType;
};

/**
 * 회원가입 폼 (웹 원본 pages/SignupFormPage.tsx). /signup/new 와 /signup/family 가 공유한다.
 * POST /auth/signup 성공 시 토큰 저장(api/auth.ts) 후
 * 신규 가구 → 주소 등록 / 가족 → 초대 코드 로 이동한다.
 */
export function SignupForm({ signupType }: SignupFormProps) {
  const router = useRouter();
  const signupMutation = useSignupMutation();
  const isNew = signupType === "new_household";

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 빈 칸 없음 + 비밀번호 일치. 상세 규칙(§2.3)은 서버 field_errors로 처리
  const isFormValid =
    name.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    loginId.trim() !== "" &&
    password !== "" &&
    passwordCheck !== "" &&
    password === passwordCheck &&
    agreed;

  const handleSubmit = async () => {
    setError(null);
    try {
      await signupMutation.mutateAsync({
        login_id: loginId,
        name,
        phone_number: phoneNumber,
        password,
        signup_type: signupType,
        household_name: isNew ? `${name} 가구` : undefined,
        terms_service_agreed: agreed,
        privacy_agreed: agreed,
      });
      // 계정이 이미 만들어졌으므로 뒤로가기로 이 폼에 돌아와 다시 제출하지 않도록 replace 한다
      router.replace(isNew ? "/signup/address" : "/signup/invite");
    } catch (e) {
      setError(getApiErrorMessage(e, "알 수 없는 오류가 발생했어요."));
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="회원가입" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* 가입 유형 표시 (선택은 이전 화면에서 끝났으므로 눌리지 않는다) */}
        <View style={styles.segmented}>
          <View style={[styles.segment, isNew && styles.segmentActive]}>
            <ThemedText
              type="subtitle03"
              color={isNew ? Palette.white : Palette.gray[300]}
            >
              신규 가구
            </ThemedText>
          </View>
          <View style={[styles.segment, !isNew && styles.segmentActive]}>
            <ThemedText
              type="subtitle03"
              color={isNew ? Palette.gray[300] : Palette.white}
            >
              가족 · 보호자
            </ThemedText>
          </View>
        </View>

        <ThemedText type="body01" color={Palette.gray[300]}>
          {isNew
            ? "신규 가구로 가입하면 센서 설치와\n가구 정보를 직접 등록합니다."
            : "가입 후 초대 코드를 입력하면\n가구 현황을 함께 볼 수 있어요."}
        </ThemedText>

        <View style={styles.form}>
          <TextField
            label="이름"
            placeholder="이름"
            value={name}
            onChangeText={setName}
            autoComplete="name"
          />
          <TextField
            label="휴대폰 번호"
            placeholder="휴대폰 번호"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            autoComplete="tel"
            keyboardType="phone-pad"
          />
          <TextField
            label="아이디"
            placeholder="아이디"
            value={loginId}
            onChangeText={setLoginId}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
          />
          <TextField
            label="비밀번호"
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />
          <TextField
            label="비밀번호 확인"
            placeholder="비밀번호 확인"
            value={passwordCheck}
            onChangeText={setPasswordCheck}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />
        </View>

        <View style={styles.spacer} />

        <Checkbox
          label="서비스 이용약관 · 개인정보 동의 (필수)"
          checked={agreed}
          onChange={setAgreed}
        />

        {error ? (
          <ThemedText type="body02" color={Palette.red[200]}>
            {error}
          </ThemedText>
        ) : null}

        <Button
          label="가입 완료"
          variant="dark"
          onPress={handleSubmit}
          disabled={!isFormValid}
          loading={signupMutation.isPending}
        />
      </ScrollView>
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
    flexGrow: 1,
    gap: Spacing.six,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
  },
  // 웹 rounded-xl bg-border p-1
  segmented: {
    flexDirection: "row",
    borderRadius: Radius.medium,
    backgroundColor: Palette.border,
    padding: Spacing.one,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    borderRadius: Radius.small,
    paddingVertical: Spacing.three,
  },
  segmentActive: {
    backgroundColor: Palette.gray[500],
  },
  form: {
    gap: Spacing.three,
  },
  spacer: {
    flex: 1,
  },
});
