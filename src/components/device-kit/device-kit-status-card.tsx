import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { kitStatusLabel } from "@/constants/device-kit";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useDeviceKitQuery } from "@/hooks/use-device-kit-query";

const CHEVRON_SIZE = 22;

export type DeviceKitStatusCardProps = {
  householdId: string;
};

/**
 * 기기 관리 상단의 키트 등록 상태 카드 (명세 "프론트 처리 순서" 2·3·4·8항).
 * - 미등록 + owner : 등록 안내 + 등록 화면 진입 버튼
 * - 미등록 + member: 소유자가 등록해야 한다는 안내
 * - 등록 완료      : 키트 ID 표시, 누르면 등록 결과(연결 상태) 화면
 * - 기존 가구      : 키트 번호가 없고 기존 기기 기능을 그대로 쓰므로 아무것도 그리지 않는다
 * 조회 전 · 실패(신규 API 미배포 404 포함)에도 기기 목록은 그대로 써야 하므로 조용히 숨긴다.
 */
export function DeviceKitStatusCard({ householdId }: DeviceKitStatusCardProps) {
  const router = useRouter();
  const kitQuery = useDeviceKitQuery(householdId);
  const kit = kitQuery.data;

  // 조회 실패면 이전 캐시가 남아 있어도 그리지 않는다 (미배포 404 등)
  if (kitQuery.isError || !kit || kit.status === "legacy_registered") {
    return null;
  }

  if (kit.status === "claimed") {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/device-kit/result")}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={[styles.text, styles.textRow]}>
          <ThemedText type="subtitle03" color={Palette.gray[600]}>
            {kitStatusLabel.claimed}
          </ThemedText>
          <ThemedText type="body02" color={Palette.gray[300]}>
            {kit.kit_id}
          </ThemedText>
        </View>
        <ChevronRight size={CHEVRON_SIZE} color={Palette.gray[200]} />
      </Pressable>
    );
  }

  // unregistered
  return (
    <View style={[styles.card, styles.cardColumn]}>
      <View style={styles.text}>
        <ThemedText type="subtitle03" color={Palette.gray[600]}>
          {kit.can_claim
            ? "기기 키트를 등록해 주세요"
            : kitStatusLabel.unregistered}
        </ThemedText>
        <ThemedText type="body02" color={Palette.gray[300]}>
          {kit.can_claim
            ? "제품에 적힌 키트 ID와 등록 코드로\n기기를 우리 가구에 등록할 수 있어요."
            : "가구 소유자가 키트를 등록하면\n기기 연결 상태를 확인할 수 있어요."}
        </ThemedText>
      </View>
      {kit.can_claim ? (
        <Button
          label="키트 등록"
          variant="dark"
          size="small"
          onPress={() => router.push("/device-kit")}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
    borderRadius: Radius.large,
    borderWidth: 2,
    borderColor: Palette.main[200],
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    ...Shadow.shadow02,
  },
  cardColumn: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  cardPressed: {
    backgroundColor: Palette.gray[100],
  },
  text: {
    gap: Spacing.one,
  },
  // 가로 배치(등록 완료)에서만 남는 폭을 차지한다. 세로 배치에 flex:1 을 주면 높이가 0 으로 접힌다
  textRow: {
    flex: 1,
  },
});
