import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getDeviceKit } from "@/api/device-kit";
import { queryKeys } from "@/api/query-keys";
import { KitDeviceList } from "@/components/device-kit/kit-device-list";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  getKitErrorMessage,
  isClaimOutcomeUnknown,
} from "@/constants/device-kit";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useClaimDeviceKitMutation } from "@/hooks/use-claim-device-kit-mutation";
import {
  clearDeviceKitDraft,
  useDeviceKitDraft,
} from "@/stores/device-kit-claim";
import { useHouseholdId } from "@/stores/session";
import { showToast } from "@/stores/toast";

const TITLE = "등록할 기기 확인";

/**
 * 미리보기로 확인한 키트 ID 와 기기 4대를 보여주고 등록을 확정한다 (명세 5·6항).
 * 입력값·미리보기는 stores/device-kit-claim.ts 에서 읽는다 — 비어 있으면(딥링크 등) 입력 화면으로.
 *
 * 응답을 못 받은 경우(통신 단절 · 503)는 실패로 단정하지 않고 GET 으로 서버 상태를 확인해
 * 같은 키트가 등록돼 있으면 완료 화면으로, 아니면 재시도를 안내한다 (명세 "요청 재전송").
 */
export default function DeviceKitConfirmScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const flowParams = from === "signup" ? { from: "signup" } : undefined;

  const householdId = useHouseholdId();
  // 마운트 시점의 초안을 스냅샷으로 든다. 등록 성공 시 mutation 이 스토어를 비우는데,
  // 스토어를 그대로 구독하면 결과 화면으로 가기 전에 아래 Redirect(입력 화면)가 먼저 발사된다.
  const storeDraft = useDeviceKitDraft();
  const [draft] = useState(storeDraft);
  const claimMutation = useClaimDeviceKitMutation();
  // GET 복구 조회 중에도 버튼을 진행 중으로 보이게 한다
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft || !householdId) {
    return <Redirect href={{ pathname: "/device-kit", params: flowParams }} />;
  }

  const { request, preview } = draft;

  const goToResult = () => {
    router.replace({ pathname: "/device-kit/result", params: flowParams });
  };

  const handleClaim = async () => {
    setError(null);
    try {
      await claimMutation.mutateAsync({ householdId, body: request });
      showToast("키트를 등록했어요.");
      goToResult();
      return;
    } catch (e) {
      if (!isClaimOutcomeUnknown(e)) {
        setError(getKitErrorMessage(e, "키트를 등록하지 못했어요."));
        return;
      }
    }

    // 결과를 알 수 없음 → 서버 상태로 판정
    setRecovering(true);
    try {
      const current = await getDeviceKit(householdId);
      if (current.status === "claimed" && current.kit_id === request.kit_id) {
        queryClient.setQueryData(
          queryKeys.deviceKit.status(householdId),
          current,
        );
        clearDeviceKitDraft();
        goToResult();
        return;
      }
      setError("등록이 완료되지 않았어요. 잠시 후 다시 시도해 주세요.");
    } catch (e) {
      setError(getKitErrorMessage(e, "등록 상태를 확인하지 못했어요."));
    } finally {
      setRecovering(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={TITLE} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kitCard}>
          <ThemedText type="subtitle03" color={Palette.gray[300]}>
            등록할 키트
          </ThemedText>
          <ThemedText type="head03" color={Palette.gray[500]}>
            {preview.kit_id}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle02" color={Palette.gray[500]}>
            포함된 기기 {preview.devices.length}대
          </ThemedText>
          <KitDeviceList devices={preview.devices} />
        </View>

        <View style={styles.notice}>
          <ThemedText type="body01" color={Palette.gray[400]}>
            등록하면 이 키트가 우리 가구의 것으로 기록돼요. 실제 기기 설정은
            설치 담당자가 진행합니다.
          </ThemedText>
        </View>

        <View style={styles.spacer} />

        {error ? (
          <ThemedText type="body02" color={Palette.red[200]}>
            {error}
          </ThemedText>
        ) : null}
        <Button
          label="등록하기"
          variant="dark"
          onPress={handleClaim}
          loading={claimMutation.isPending || recovering}
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
  kitCard: {
    gap: Spacing.two,
    borderRadius: Radius.medium,
    backgroundColor: Palette.white,
    padding: Spacing.five,
    ...Shadow.shadow03,
  },
  section: {
    gap: Spacing.three,
  },
  notice: {
    borderWidth: 1,
    borderColor: Palette.main[200],
    borderRadius: Radius.medium,
    backgroundColor: Palette.yellow[100],
    padding: Spacing.four,
  },
  spacer: {
    flex: 1,
  },
});
