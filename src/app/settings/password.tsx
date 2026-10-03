import { useState, type ReactNode } from "react";

import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import { Palette, Spacing } from "@/constants/theme";

const TITLE = "비밀번호 설정";
/** 변경 성공 후 로그인 화면으로 보내기까지의 대기 (웹과 동일) */
const DONE_REDIRECT_MS = 1500;
/** 변경 요청 흉내 (API 연동 전) */
const SUBMIT_DELAY_MS = 500;

// 명세 §2.3 비밀번호 규칙: 10자 이상, 영문자와 숫자 포함
function validateNewPassword(pw: string): string | null {
  if (pw.length < 10) return "10자 이상 입력해 주세요.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) {
    return "영문자와 숫자를 모두 포함해 주세요.";
  }
  return null;
}

/**
 * 비밀번호 설정 (웹 원본 pages/PasswordSettingsPage.tsx).
 * 명세 §4.5 PATCH /me/password — 성공(204) 시 토큰 전면 무효화 → 재로그인.
 *
 * TODO: API 연동 — 서버 field_errors 를 입력칸 하단에 표시, 토큰 정리.
 */
export default function PasswordSettingsScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  // 서버 검증 오류(field_errors) — 입력칸 하단 노출
  const [fieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    setError(null);

    if (!current) {
      setError("현재 비밀번호를 입력해 주세요.");
      return;
    }
    const pwError = validateNewPassword(next);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (next !== confirm) {
      setError("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      setTimeout(() => router.replace("/login"), DONE_REDIRECT_MS);
    }, SUBMIT_DELAY_MS);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScreenHeader title={TITLE} />
        <View style={styles.doneBox}>
          <ThemedText
            type="subtitle02"
            color={Palette.gray[600]}
            style={styles.centerText}
          >
            비밀번호를 변경했어요.
          </ThemedText>
          <ThemedText
            type="body02"
            color={Palette.gray[300]}
            style={styles.centerText}
          >
            보안을 위해 다시 로그인해 주세요.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={TITLE} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="현재 비밀번호" error={fieldErrors.current_password}>
          <TextField
            label="현재 비밀번호"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
          />
        </Field>

        <Field label="새 비밀번호" error={fieldErrors.new_password}>
          <TextField
            label="새 비밀번호"
            value={next}
            onChangeText={setNext}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />
          <ThemedText type="body03" color={Palette.gray[300]}>
            10자 이상, 영문자와 숫자를 포함해 주세요.
          </ThemedText>
        </Field>

        <Field label="새 비밀번호 확인">
          <TextField
            label="새 비밀번호 확인"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            onSubmitEditing={handleSubmit}
          />
        </Field>

        {error ? (
          <ThemedText type="body02" color={Palette.red[200]}>
            {error}
          </ThemedText>
        ) : null}

        <Button
          label="변경하기"
          variant="dark"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="label03" color={Palette.gray[500]}>
        {label}
      </ThemedText>
      {children}
      {error ? (
        <ThemedText type="body03" color={Palette.red[200]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
  },
  field: {
    gap: Spacing.two,
  },
  submit: {
    marginTop: Spacing.two,
  },
  doneBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.seven,
  },
  centerText: {
    textAlign: "center",
  },
});
