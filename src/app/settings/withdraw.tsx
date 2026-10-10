import { useState } from "react";

import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiHttpError, getApiErrorMessage } from "@/api/http-error";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useCurrentHouseholdQuery } from "@/hooks/use-current-household-query";
import { useDeleteAccountMutation } from "@/hooks/use-delete-account-mutation";
import { resetToStart } from "@/utils/navigation";

const TITLE = "회원 탈퇴";

/**
 * 회원 탈퇴 (DELETE /me). 웹 원본에는 없는 화면 — C 의 Alert 최종 확인 패턴을 따르되,
 * 현재 비밀번호 입력이 필요해 전용 화면으로 둔다.
 *
 * member: 본인만 가구에서 제거. owner: 가구 비활성화 + 기존 member 연동 해제 →
 * owner 에게는 경고 문구 + 확인 체크 + 최종 Alert 의 3단계로 확인받는다.
 */
export default function WithdrawScreen() {
  const { isOwner, isLoading: roleLoading } = useCurrentHouseholdQuery();
  const deleteAccountMutation = useDeleteAccountMutation();
  const [password, setPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    password.length > 0 && (!isOwner || acknowledged) && !roleLoading;

  const submit = async () => {
    setError(null);
    try {
      await deleteAccountMutation.mutateAsync({ current_password: password });
      // 성공(204) → api/me.ts 가 토큰·세션을 지웠다. 스택을 비우고 시작 화면으로.
      resetToStart();
    } catch (e) {
      if (
        e instanceof ApiHttpError &&
        (e.code === "CURRENT_PASSWORD_MISMATCH" || e.status === 409)
      ) {
        setError("현재 비밀번호가 일치하지 않아요.");
        return;
      }
      setError(
        getApiErrorMessage(e, "탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요."),
      );
    }
  };

  // 최종 확인 (C 의 my.tsx 회원 탈퇴 Alert 와 같은 흐름). 되돌릴 수 없는 작업이라 한 번 더 묻는다.
  const confirmWithdraw = () => {
    Alert.alert(
      TITLE,
      isOwner
        ? "탈퇴하면 가구가 비활성화되고 가족 구성원의 연동이 모두 해제됩니다.\n정말 탈퇴할까요?"
        : "탈퇴하면 이 가구에서 내 계정이 제거됩니다.\n정말 탈퇴할까요?",
      [
        { text: "취소", style: "cancel" },
        { text: "탈퇴", style: "destructive", onPress: () => void submit() },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={TITLE} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.warning}>
          <ThemedText type="subtitle02" color={Palette.gray[600]}>
            {isOwner ? "가구 소유자 탈퇴 안내" : "탈퇴 전에 확인해 주세요"}
          </ThemedText>
          <ThemedText type="body02" color={Palette.gray[500]}>
            {isOwner
              ? "소유자가 탈퇴하면 가구가 비활성화되고, 연동된 가족 구성원의 가구 연동도 모두 해제됩니다. 기기 알림과 감지 이력을 더 이상 받을 수 없어요."
              : "탈퇴하면 이 가구에서 내 계정만 제거됩니다. 가구와 다른 구성원에게는 영향이 없어요."}
          </ThemedText>
          <ThemedText type="body02" color={Palette.red[200]}>
            이 작업은 되돌릴 수 없어요.
          </ThemedText>
        </View>

        {isOwner ? (
          <Checkbox
            label="가구가 비활성화되고 가족 연동이 해제되는 것을 확인했어요"
            checked={acknowledged}
            onChange={setAcknowledged}
          />
        ) : null}

        <View style={styles.field}>
          <ThemedText type="label03" color={Palette.gray[500]}>
            현재 비밀번호
          </ThemedText>
          <TextField
            label="현재 비밀번호"
            placeholder="본인 확인을 위해 입력해 주세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="done"
          />
          {error ? (
            <ThemedText type="body03" color={Palette.red[200]}>
              {error}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.spacer} />

        <Button
          label="탈퇴하기"
          variant="dark"
          onPress={confirmWithdraw}
          disabled={!canSubmit}
          loading={deleteAccountMutation.isPending}
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
    gap: Spacing.five,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
  },
  warning: {
    gap: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Palette.red[200],
    backgroundColor: Palette.red[100],
    padding: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  spacer: {
    flex: 1,
  },
});
