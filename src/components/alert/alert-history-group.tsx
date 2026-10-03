import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ALERT_CONFIG } from "@/constants/alert";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { type AlertHistoryAlarm, type AlertHistoryDay } from "@/types/alert";
import { formatAlertDayLabel, formatAlertTime } from "@/utils/date";

/** 웹 h-2.5 w-2.5 */
const DOT_SIZE = 10;
/** 웹 gap-2.5 */
const DOT_GAP = 10;

export type AlertHistoryGroupProps = AlertHistoryDay;

/** 알람 탭의 날짜별 묶음 (웹 원본 components/AlertHistoryGroup.tsx) */
export function AlertHistoryGroup({
  date,
  display_label,
  alarms,
}: AlertHistoryGroupProps) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle02" color={Palette.gray[600]}>
        {formatAlertDayLabel(date, display_label)}
      </ThemedText>

      <View style={styles.list}>
        {alarms.map((alarm, index) => (
          <AlertHistoryRow
            key={alarm.id}
            alarm={alarm}
            showDivider={index > 0}
          />
        ))}
      </View>
    </View>
  );
}

interface AlertHistoryRowProps {
  alarm: AlertHistoryAlarm;
  showDivider: boolean;
}

function AlertHistoryRow({ alarm, showDivider }: AlertHistoryRowProps) {
  const config = ALERT_CONFIG[alarm.type];

  return (
    <View style={[styles.row, showDivider && styles.rowDivided]}>
      <View style={styles.rowLeft}>
        <View style={[styles.dot, { backgroundColor: config.dotColor }]} />
        <ThemedText
          type="subtitle03"
          color={Palette.gray[600]}
          numberOfLines={1}
          style={styles.sound}
        >
          {alarm.sound} 감지
        </ThemedText>
      </View>

      <ThemedText type="body01" color={Palette.gray[300]}>
        {alarm.location} · {formatAlertTime(alarm.local_time)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.four,
  },
  list: {
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.one,
    ...Shadow.shadow03,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: DOT_GAP,
    flexShrink: 1,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Radius.pill,
  },
  sound: {
    flexShrink: 1,
  },
});
