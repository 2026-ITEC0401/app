import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiHttpError, getApiErrorMessage } from "@/api/http-error";
import { EmergencyActions } from "@/components/alert/emergency-actions";
import { ThemedText } from "@/components/themed-text";
import { CenteredMessage } from "@/components/ui/centered-message";
import { InfoRow } from "@/components/ui/info-row";
import { ScreenHeader } from "@/components/ui/screen-header";
import { ALERT_CONFIG } from "@/constants/alert";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useAlarmDetailQuery } from "@/hooks/use-alarm-detail-query";
import { useHouseholdId } from "@/stores/session";
import { toWebDataFromDetail } from "@/utils/alert-mapper";
import { toAlertTimeParts } from "@/utils/alert-time";

const TITLE = "상세 보기";
/** 웹 h-26 w-26 */
const ICON_SIZE = 104;
/** 웹 h-8 */
const BADGE_HEIGHT = 32;

/**
 * 알림 상세 (웹 원본 pages/AlertInfoPage.tsx).
 * GET /alarms/{id} — 로딩 · 404 · 에러는 Fallback 으로.
 */
export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const householdId = useHouseholdId();
  const detailQuery = useAlarmDetailQuery(householdId, id);

  if (detailQuery.isLoading) {
    return <Fallback>불러오는 중…</Fallback>;
  }
  if (detailQuery.isError) {
    const notFound =
      detailQuery.error instanceof ApiHttpError &&
      detailQuery.error.status === 404;
    return notFound ? (
      <Fallback>알림을 찾을 수 없어요.</Fallback>
    ) : (
      <Fallback tone="error">
        {getApiErrorMessage(detailQuery.error, "알림을 불러오지 못했어요.")}
      </Fallback>
    );
  }
  if (!detailQuery.data) {
    return <Fallback>알림을 찾을 수 없어요.</Fallback>;
  }

  const alert = toWebDataFromDetail(detailQuery.data.alarm);
  const config = ALERT_CONFIG[alert.type];
  const { date, meridiem, clock } = toAlertTimeParts(alert);

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={TITLE} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image
            source={config.icon}
            style={styles.icon}
            contentFit="contain"
            accessibilityLabel={`${config.badgeLabel} 알림 아이콘`}
          />
          <View
            style={[styles.badge, { backgroundColor: config.badgeBackground }]}
          >
            <ThemedText type="subtitle03" color={Palette.white}>
              {config.badgeLabel}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoWrap}>
          <View style={styles.infoCard}>
            <InfoRow label="날짜" value={date} />
            <InfoRow label={meridiem} value={clock} />
            <InfoRow label="위치" value={alert.location} />
            {/* 과거 알림은 raw_label이 null이라 상위 소리 이름으로 대체한다 */}
            <InfoRow
              label="소리"
              value={alert.raw_label ?? alert.sound}
              showDivider={false}
            />
          </View>
        </View>

        {alert.type === "Urgent" ? <EmergencyActions alert={alert} /> : null}
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
  content: {
    paddingBottom: Spacing.ten,
  },
  hero: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.seven,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  badge: {
    height: BADGE_HEIGHT,
    justifyContent: "center",
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.five,
  },
  infoWrap: {
    paddingHorizontal: Spacing.five,
  },
  infoCard: {
    borderRadius: Radius.xxlarge,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.one,
  },
});
