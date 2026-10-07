import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleCheck } from "lucide-react-native";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KitDeviceList } from "@/components/device-kit/kit-device-list";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { CenteredMessage } from "@/components/ui/centered-message";
import { InfoRow } from "@/components/ui/info-row";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  getKitErrorMessage,
  KIT_CLAIMED_DESCRIPTION,
  KIT_CLAIMED_TITLE,
  kitStatusLabel,
} from "@/constants/device-kit";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useDeviceKitQuery } from "@/hooks/use-device-kit-query";
import { useHouseholdId } from "@/stores/session";
import { formatDateDots } from "@/utils/date";
import { resetToHome } from "@/utils/navigation";

const TITLE = "기기 키트 등록";
const CHECK_ICON_SIZE = 64;

/**
 * 등록 결과 · 연결 상태 (명세 7·8·10항).
 * GET 등록 상태를 그대로 그린다 — 등록 확정 응답으로 캐시가 채워져 있고, 앱 재실행 · 재진입 시엔 재조회로 복구된다.
 * 등록 직후엔 기기가 모두 "연결 대기"인 게 정상이며, 설치 담당자가 설정을 마치면 "연결됨"으로 바뀐다.
 * 키트 상태용 WS 이벤트는 없으므로 당겨서 새로고침으로 다시 조회한다.
 */
export default function DeviceKitResultScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromSignup = from === "signup";

  const householdId = useHouseholdId();
  const kitQuery = useDeviceKitQuery(householdId);
  const kit = kitQuery.data;

  if (!householdId) {
    return <Fallback>가구 연동이 필요합니다.</Fallback>;
  }
  if (kitQuery.isLoading) {
    return <Fallback>불러오는 중…</Fallback>;
  }
  if (kitQuery.isError || !kit) {
    return (
      <Fallback tone="error">
        {getKitErrorMessage(kitQuery.error, "등록 상태를 불러오지 못했어요.")}
      </Fallback>
    );
  }

  const isClaimed = kit.status === "claimed";

  return (
    <SafeAreaView style={styles.screen}>
      {/* 가입 흐름에서는 뒤로 갈 곳이 입력 화면뿐이라 뒤로가기를 숨기고 "홈으로"로 끝낸다 */}
      <ScreenHeader title={TITLE} showBackButton={!fromSignup} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={kitQuery.isFetching}
            onRefresh={() => kitQuery.refetch()}
          />
        }
      >
        {kit.status === "unregistered" ? (
          <View style={styles.hero}>
            <ThemedText type="head03" color={Palette.gray[500]}>
              {kitStatusLabel.unregistered}
            </ThemedText>
            <ThemedText
              type="body01"
              color={Palette.gray[300]}
              style={styles.centered}
            >
              {kit.can_claim
                ? "아직 등록된 키트가 없어요."
                : "가구 소유자가 키트를 등록하면\n기기 연결 상태를 확인할 수 있어요."}
            </ThemedText>
            {kit.can_claim ? (
              <Button
                label="키트 등록하기"
                variant="dark"
                onPress={() => router.replace("/device-kit")}
                style={styles.heroButton}
              />
            ) : null}
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              <CircleCheck size={CHECK_ICON_SIZE} color={Palette.success} />
              <ThemedText
                type="head03"
                color={Palette.gray[500]}
                style={styles.centered}
              >
                {isClaimed
                  ? KIT_CLAIMED_TITLE
                  : kitStatusLabel.legacy_registered}
              </ThemedText>
              <ThemedText
                type="body01"
                color={Palette.gray[300]}
                style={styles.centered}
              >
                {KIT_CLAIMED_DESCRIPTION}
              </ThemedText>
            </View>

            {isClaimed ? (
              <View style={styles.infoCard}>
                <InfoRow label="키트 ID" value={kit.kit_id ?? "-"} />
                <InfoRow
                  label="등록일"
                  value={kit.claimed_at ? formatDateDots(kit.claimed_at) : "-"}
                  showDivider={false}
                />
              </View>
            ) : null}
          </>
        )}

        <View style={styles.section}>
          <ThemedText type="subtitle02" color={Palette.gray[500]}>
            기기 연결 상태
          </ThemedText>
          <KitDeviceList devices={kit.devices} />
        </View>

        {fromSignup ? (
          <>
            <View style={styles.spacer} />
            <Button label="홈으로" variant="dark" onPress={resetToHome} />
          </>
        ) : null}
      </ScrollView>
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
  },
  // 고정 하단 여백 대신 스크롤 끝에만 여백을 둔다 (기기 상세와 같은 방식)
  content: {
    flexGrow: 1,
    gap: Spacing.six,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.ten,
  },
  hero: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  heroButton: {
    marginTop: Spacing.two,
  },
  centered: {
    textAlign: "center",
  },
  infoCard: {
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.five,
  },
  section: {
    gap: Spacing.three,
  },
  spacer: {
    flex: 1,
  },
});
