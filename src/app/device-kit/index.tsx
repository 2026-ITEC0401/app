import { useEffect, useState } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeOff, Info } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CLAIM_CODE_MAX_LENGTH,
  KIT_ID_MAX_LENGTH,
  toClaimRequest,
} from "@/api/device-kit";
import { CompleteHeader } from "@/components/signup/complete-header";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { CenteredMessage } from "@/components/ui/centered-message";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import {
  getKitErrorMessage,
  isKitApiUnavailable,
  KIT_UNAVAILABLE_NOTICE,
  kitStatusLabel,
} from "@/constants/device-kit";
import { Palette, Radius, Spacing, Typography } from "@/constants/theme";
import { useDeviceKitPreviewMutation } from "@/hooks/use-device-kit-preview-mutation";
import { useDeviceKitQuery } from "@/hooks/use-device-kit-query";
import {
  clearDeviceKitDraft,
  setDeviceKitDraft,
} from "@/stores/device-kit-claim";
import { useHouseholdId } from "@/stores/session";
import { showToast } from "@/stores/toast";
import { resetToHome } from "@/utils/navigation";

const TITLE = "기기 키트 등록";
const INFO_ICON_SIZE = 16;
const EYE_ICON_SIZE = 22;
/** 눈 아이콘 자리만큼 입력 글자가 겹치지 않게 비운다 */
const EYE_BUTTON_WIDTH = 48;

const INVALID_MESSAGES = {
  kit_id: "키트 ID 형식이 올바르지 않아요. 예: HEARO-KIT-0001",
  claim_code: "등록 코드 형식이 올바르지 않아요. 예: K7QM-29XA",
} as const;

/**
 * 키트 ID · 등록 코드 입력 (명세 "프론트 처리 순서" 3·4·5항).
 *
 * 진입: 신규 가구 주소 등록 직후(from=signup, 건너뛰기 가능) 또는 설정 › 기기 관리.
 * POST claim/preview 로 키트를 확인하고 결과와 입력값을 메모리 스토어에 올린 뒤 확인 화면으로 간다
 * (등록 코드는 URL 파라미터로 넘기지 않는다). 이미 등록된 가구(claimed · legacy)는 입력 대신
 * 현재 상태를 보여준다 — 결과 화면으로 자동 이동하면 뒤로가기가 여기로 돌아와 다시 튕기기 때문.
 */
export default function DeviceKitEntryScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromSignup = from === "signup";
  const flowParams = fromSignup ? { from: "signup" } : undefined;

  const householdId = useHouseholdId();
  const kitQuery = useDeviceKitQuery(householdId);
  const previewMutation = useDeviceKitPreviewMutation();

  const [kitId, setKitId] = useState("");
  const [claimCode, setClaimCode] = useState("");
  // 등록 코드는 기본 마스킹, 사용자가 누르는 동안만 보인다 (명세)
  const [codeVisible, setCodeVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 흐름을 벗어나면(뒤로가기 · 홈으로) 입력 중이던 등록 코드를 메모리에서 지운다
  useEffect(() => clearDeviceKitDraft, []);

  // 신규 API 가 아직 서버에 없으면(404) 이 화면에 머물 이유가 없다 → 토스트로 알리고 이전 화면으로.
  // 가입 흐름에서는 이전 화면이 가입 폼이라 홈으로 보낸다.
  const unavailable = kitQuery.isError && isKitApiUnavailable(kitQuery.error);
  useEffect(() => {
    if (!unavailable) return;
    showToast(KIT_UNAVAILABLE_NOTICE);
    if (fromSignup) {
      resetToHome();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      resetToHome();
    }
  }, [unavailable, fromSignup, router]);

  const handleFindDevices = async () => {
    if (!householdId) return;
    setError(null);
    const normalized = toClaimRequest(kitId, claimCode);
    if ("invalid" in normalized) {
      setError(INVALID_MESSAGES[normalized.invalid]);
      return;
    }
    try {
      const preview = await previewMutation.mutateAsync({
        householdId,
        body: normalized.body,
      });
      setDeviceKitDraft({ request: normalized.body, preview });
      router.push({ pathname: "/device-kit/confirm", params: flowParams });
    } catch (e) {
      setError(getKitErrorMessage(e, "키트를 확인하지 못했어요."));
    }
  };

  const kit = kitQuery.data;

  let body: React.ReactNode;
  if (!householdId) {
    body = <CenteredMessage>가구 연동이 필요합니다.</CenteredMessage>;
  } else if (kitQuery.isLoading || unavailable) {
    // 미배포(404)는 위 효과가 곧 화면을 닫으므로 그동안 빈 로딩 상태만 보여준다
    body = <CenteredMessage>불러오는 중…</CenteredMessage>;
  } else if (kitQuery.isError) {
    body = (
      <CenteredMessage tone="error">
        {getKitErrorMessage(kitQuery.error, "키트 정보를 불러오지 못했어요.")}
      </CenteredMessage>
    );
  } else if (kit && kit.status !== "unregistered") {
    // 이미 등록된 가구 — 현재 상태만 보여주고 결과 화면으로 안내
    body = (
      <View style={styles.content}>
        <View style={styles.titleBlock}>
          <ThemedText type="head02" color={Palette.gray[500]}>
            {kitStatusLabel[kit.status]}
          </ThemedText>
          <ThemedText type="body01" color={Palette.gray[300]}>
            {kit.kit_id
              ? `${kit.kit_id} 키트가 이 가구에 등록되어 있어요.`
              : "이 가구는 기기가 이미 등록되어 있어요."}
          </ThemedText>
        </View>
        <View style={styles.spacer} />
        <Button
          label="연결 상태 보기"
          variant="dark"
          onPress={() =>
            router.push({ pathname: "/device-kit/result", params: flowParams })
          }
        />
      </View>
    );
  } else if (kit && !kit.can_claim) {
    // member 의 미등록 가구 — owner 가 등록해야 한다 (명세 4항)
    body = (
      <View style={styles.content}>
        <View style={styles.titleBlock}>
          <ThemedText type="head02" color={Palette.gray[500]}>
            {kitStatusLabel.unregistered}
          </ThemedText>
          <ThemedText type="body01" color={Palette.gray[300]}>
            가구 소유자가 키트를 등록하면{"\n"}기기 연결 상태를 확인할 수
            있어요.
          </ThemedText>
        </View>
      </View>
    );
  } else {
    body = (
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleBlock}>
          <ThemedText type="head02" color={Palette.gray[500]}>
            {TITLE}
          </ThemedText>
          <ThemedText type="body01" color={Palette.gray[300]}>
            제품에 적힌 키트 ID와{"\n"}등록 코드를 입력해 주세요.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <TextField
            label="키트 ID"
            placeholder="키트 ID (예: HEARO-KIT-0001)"
            value={kitId}
            onChangeText={setKitId}
            maxLength={KIT_ID_MAX_LENGTH}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
          />
          <View>
            <TextField
              label="등록 코드"
              placeholder="등록 코드 (예: K7QM-29XA)"
              value={claimCode}
              onChangeText={setClaimCode}
              maxLength={CLAIM_CODE_MAX_LENGTH}
              secureTextEntry={!codeVisible}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleFindDevices}
              style={styles.codeInput}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                codeVisible ? "등록 코드 숨기기" : "등록 코드 보기"
              }
              onPressIn={() => setCodeVisible(true)}
              onPressOut={() => setCodeVisible(false)}
              style={styles.eyeButton}
            >
              {codeVisible ? (
                <EyeOff size={EYE_ICON_SIZE} color={Palette.gray[300]} />
              ) : (
                <Eye size={EYE_ICON_SIZE} color={Palette.gray[300]} />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Info size={INFO_ICON_SIZE} color={Palette.gray[300]} />
          </View>
          <ThemedText
            type="body02"
            color={Palette.gray[300]}
            style={styles.infoText}
          >
            등록 후 설치 담당자가 기기 설정을 마치면 연결 상태가 표시돼요.
          </ThemedText>
        </View>

        <View style={styles.spacer} />

        {error ? (
          <ThemedText type="body02" color={Palette.red[200]}>
            {error}
          </ThemedText>
        ) : null}
        <Button
          label="기기 확인"
          variant="dark"
          onPress={handleFindDevices}
          disabled={kitId.trim() === "" || claimCode.trim() === ""}
          loading={previewMutation.isPending}
        />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {fromSignup ? (
        <CompleteHeader onSkip={() => resetToHome()} />
      ) : (
        <ScreenHeader title={TITLE} />
      )}
      {body}
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
  titleBlock: {
    gap: Spacing.two,
  },
  form: {
    gap: Spacing.three,
  },
  codeInput: {
    paddingRight: EYE_BUTTON_WIDTH,
  },
  eyeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: EYE_BUTTON_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.medium,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.one,
  },
  // 두 줄로 접히는 문구의 첫 줄 가운데에 아이콘을 맞춘다 (body02 줄 높이 22 - 아이콘 16) / 2
  infoIcon: {
    paddingTop: (Typography.body02.lineHeight - INFO_ICON_SIZE) / 2,
  },
  infoText: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
});
