import { useState } from "react";

import { Redirect, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/http-error";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { CenteredMessage } from "@/components/ui/centered-message";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useLinkHouseholdMutation } from "@/hooks/use-link-household-mutation";
import { useLinkPreviewQuery } from "@/hooks/use-link-preview-query";
import type { RoomLabel } from "@/types/room";
import { resetToHome } from "@/utils/navigation";

const TITLE = "가구 연동";
const ROOM_LABELS: RoomLabel[] = ["현관", "거실", "안방", "화장실"];

/**
 * 가구 연동 확인 (웹 원본 pages/HouseholdLinkPage.tsx).
 *
 * 웹은 location.state 로 preview 를 넘겼지만 expo-router 는 URL 파라미터만 받으므로
 * inviteCode 만 넘기고 preview 는 쿼리 캐시(초대 코드 화면이 채움)에서 읽는다.
 * 캐시가 비어 있으면(딥링크 등) 여기서 다시 조회한다.
 */
export default function HouseholdLinkScreen() {
  const { inviteCode } = useLocalSearchParams<{ inviteCode?: string }>();
  const previewQuery = useLinkPreviewQuery(inviteCode ?? null);
  const linkMutation = useLinkHouseholdMutation();
  const [error, setError] = useState<string | null>(null);

  if (!inviteCode) {
    return <Redirect href="/signup/invite" />;
  }

  if (previewQuery.isLoading) {
    return <Fallback>불러오는 중…</Fallback>;
  }
  if (previewQuery.isError) {
    return (
      <Fallback tone="error">
        {getApiErrorMessage(
          previewQuery.error,
          "가구 정보를 불러오지 못했어요.",
        )}
      </Fallback>
    );
  }

  const household = previewQuery.data?.linkable
    ? previewQuery.data.household
    : null;
  if (!household) {
    return <Fallback>연동할 수 없는 코드예요. 다시 확인해 주세요.</Fallback>;
  }

  const registeredAt = household.created_at.slice(0, 7).replace("-", ".");

  // POST /households/link — 성공 시 household_id 는 mutation 훅이 세션에 올린다
  const handleLink = async () => {
    setError(null);
    try {
      await linkMutation.mutateAsync(inviteCode);
      resetToHome();
    } catch (e) {
      setError(getApiErrorMessage(e, "알 수 없는 오류가 발생했어요."));
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={TITLE} />

      <View style={styles.content}>
        <View style={styles.card}>
          <ThemedText
            type="subtitle03"
            color={Palette.gray[300]}
            style={styles.cardLabel}
          >
            연동 대상 가구
          </ThemedText>
          <View style={styles.cardBody}>
            <ThemedText type="head03" color={Palette.gray[500]}>
              {household.name}
            </ThemedText>
            <ThemedText type="body01" color={Palette.gray[300]}>
              {`가구원 ${household.member_count}명 · 등록일 ${registeredAt}`}
            </ThemedText>
          </View>
          <View style={styles.chips}>
            {ROOM_LABELS.map((room) => (
              <View key={room} style={styles.chip}>
                <ThemedText type="label06" color={Palette.gray[300]}>
                  {room}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.notice}>
          <ThemedText type="body01" color={Palette.gray[400]}>
            연동하면 이 가구의 알림과{"\n"}감지 이력을 함께 받게 됩니다.
          </ThemedText>
        </View>

        <View style={styles.spacer} />

        {error ? (
          <ThemedText type="body02" color={Palette.red[200]}>
            {error}
          </ThemedText>
        ) : null}
        <Button
          label="연동하기"
          variant="dark"
          onPress={handleLink}
          loading={linkMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

function Fallback({ children, tone }: { children: string; tone?: "error" }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={TITLE} />
      <CenteredMessage tone={tone}>{children}</CenteredMessage>
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
  card: {
    borderRadius: Radius.medium,
    backgroundColor: Palette.white,
    padding: Spacing.five,
    ...Shadow.shadow03,
  },
  cardLabel: {
    marginBottom: Spacing.four,
  },
  cardBody: {
    marginBottom: Spacing.three,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chip: {
    borderRadius: Radius.pill,
    backgroundColor: Palette.gray[100],
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
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
