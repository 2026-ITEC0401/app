import { useState } from "react";

import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { MOCK_LINK_PREVIEW } from "@/mocks/household";
import type { RoomLabel } from "@/types/room";

const ROOM_LABELS: RoomLabel[] = ["현관", "거실", "안방", "화장실"];

/**
 * 가구 연동 확인 (웹 원본 pages/HouseholdLinkPage.tsx).
 *
 * 웹은 location.state 로 preview 를 넘겼지만 expo-router 는 URL 파라미터만 받으므로
 * inviteCode 만 넘기고 preview 는 여기서 다시 조회한다.
 * TODO: API 연동 — preview 재조회 + POST /households/link.
 */
export default function HouseholdLinkScreen() {
  const router = useRouter();
  const { inviteCode } = useLocalSearchParams<{ inviteCode?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!inviteCode) {
    return <Redirect href="/signup/invite" />;
  }

  const household = MOCK_LINK_PREVIEW.household;
  const registeredAt = household?.created_at.slice(0, 7).replace("-", ".");

  const handleLink = () => {
    setError(null);
    setLoading(true);
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="가구 연동" />

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
              {household?.name}
            </ThemedText>
            <ThemedText type="body01" color={Palette.gray[300]}>
              {`가구원 ${household?.member_count}명 · 등록일 ${registeredAt}`}
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
          disabled={loading}
        />
      </View>
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
