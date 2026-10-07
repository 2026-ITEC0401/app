import { useState } from "react";

import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/http-error";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TermContentModal } from "@/components/ui/term-content-modal";
import { TextField } from "@/components/ui/text-field";
import type { TermContentCode } from "@/constants/terms";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useSignupMutation } from "@/hooks/use-signup-mutation";
import type { SignupType } from "@/types/signup";

export type SignupFormProps = {
  /** 이전 화면에서 고른 가입 유형. 폼 안의 탭으로 바꿀 수 있어 초기값으로만 쓴다 */
  signupType: SignupType;
};

const SIGNUP_TABS: { value: SignupType; label: string }[] = [
  { value: "new_household", label: "신규 가구" },
  { value: "family_member", label: "가족 · 보호자" },
];

/**
 * 필수 동의 항목 (C 레퍼런스 가입 화면의 AGREEMENTS 구성).
 * 이용약관·개인정보는 전문 보기(모달)가 있고, 만 14세 확인은 체크만 받는다 (개인정보 처리방침 제11조).
 */
const AGREEMENTS = [
  {
    key: "terms",
    label: "(필수) 서비스 이용약관 동의",
    term: "TERMS_OF_SERVICE",
  },
  {
    key: "privacy",
    label: "(필수) 개인정보 수집·이용 동의",
    term: "PRIVACY_POLICY",
  },
  { key: "age", label: "(필수) 만 14세 이상입니다", term: null },
] as const satisfies readonly {
  key: string;
  label: string;
  term: TermContentCode | null;
}[];

type AgreementKey = (typeof AGREEMENTS)[number]["key"];
type Agreements = Record<AgreementKey, boolean>;

const NONE_AGREED: Agreements = { terms: false, privacy: false, age: false };
const ALL_AGREED: Agreements = { terms: true, privacy: true, age: true };

/**
 * 회원가입 폼 (웹 원본 pages/SignupFormPage.tsx). /signup/new 와 /signup/family 가 공유한다.
 * 상단 탭으로 가입 유형을 바꿀 수 있다 (입력한 값은 유지, 라우트는 그대로).
 * POST /auth/signup 성공 시 토큰 저장(api/auth.ts) 후
 * 신규 가구 → 주소 등록 / 가족 → 초대 코드 로 이동한다.
 */
export function SignupForm({ signupType: initialSignupType }: SignupFormProps) {
  const router = useRouter();
  const signupMutation = useSignupMutation();
  const [signupType, setSignupType] = useState<SignupType>(initialSignupType);
  const isNew = signupType === "new_household";

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [agreements, setAgreements] = useState<Agreements>(NONE_AGREED);
  // 전문 보기 모달에 띄울 약관 코드 (null 이면 닫힘)
  const [termModal, setTermModal] = useState<TermContentCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allAgreed = AGREEMENTS.every((item) => agreements[item.key]);

  // 빈 칸 없음 + 비밀번호 일치. 상세 규칙(§2.3)은 서버 field_errors로 처리
  const isFormValid =
    name.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    loginId.trim() !== "" &&
    password !== "" &&
    passwordCheck !== "" &&
    password === passwordCheck &&
    allAgreed;

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
        terms_service_agreed: agreements.terms,
        privacy_agreed: agreements.privacy,
        age_over_14_agreed: agreements.age,
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
        {/* 가입 유형 탭. 이전 화면의 선택을 여기서 바꿀 수 있다 (가입 중엔 잠근다) */}
        <View style={styles.segmented}>
          {SIGNUP_TABS.map((tab) => {
            const selected = tab.value === signupType;
            return (
              <Pressable
                key={tab.value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                disabled={signupMutation.isPending}
                onPress={() => setSignupType(tab.value)}
                style={[styles.segment, selected && styles.segmentActive]}
              >
                <ThemedText
                  type="subtitle03"
                  color={selected ? Palette.white : Palette.gray[300]}
                >
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
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

        {/* 약관 동의. 전체 동의 한 줄 + 항목별 체크, 이용약관·개인정보는 "보기"로 전문을 연다 */}
        <View style={styles.agreements}>
          <Checkbox
            label="전체 동의"
            labelType="subtitle03"
            checked={allAgreed}
            onChange={(next) => setAgreements(next ? ALL_AGREED : NONE_AGREED)}
          />
          <View style={styles.agreementDivider} />
          {AGREEMENTS.map((item) => (
            <Checkbox
              key={item.key}
              label={item.label}
              checked={agreements[item.key]}
              onChange={(next) =>
                setAgreements((prev) => ({ ...prev, [item.key]: next }))
              }
              moreLabel={item.term ? "보기" : undefined}
              onPressMore={
                item.term ? () => setTermModal(item.term) : undefined
              }
            />
          ))}
        </View>

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

      <TermContentModal code={termModal} onClose={() => setTermModal(null)} />
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
  agreements: {
    gap: Spacing.three,
  },
  agreementDivider: {
    height: 1,
    backgroundColor: Palette.border,
  },
});
