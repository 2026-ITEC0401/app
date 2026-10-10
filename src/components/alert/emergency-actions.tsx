import { Mail, Phone, type LucideIcon } from "lucide-react-native";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import {
  EMERGENCY_NUMBER,
  VIDEO_CALL_REQUEST_BODY,
  buildFamilyNoticeBody,
  buildReportBody,
} from "@/constants/emergency";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useEmergencyAddressQuery } from "@/hooks/use-emergency-address-query";
import { useMembersQuery } from "@/hooks/use-members-query";
import { useHouseholdId } from "@/stores/session";
import { type AlertWebData } from "@/types/alert";
import { toAlertTimeParts } from "@/utils/alert-time";
import { buildSmsHref } from "@/utils/sms";

/** 웹 h-15 */
const ACTION_HEIGHT = 60;
const ACTION_ICON_SIZE = 24;
const DISABLED_OPACITY = 0.4;

export type EmergencyActionsProps = {
  alert: AlertWebData;
};

/**
 * 긴급 알림 상세의 신고 버튼 묶음 (웹 원본 components/EmergencyActions.tsx).
 * 권한(role)·가족 전화·긴급 주소를 실데이터로 확보한다. 주소는 미등록(404)일 수 있다.
 * 구성원 조회에 실패하면 웹과 같이 빈 목록으로 보고 보호자용 버튼을 그린다.
 */
export function EmergencyActions({ alert }: EmergencyActionsProps) {
  const householdId = useHouseholdId();
  const membersQuery = useMembersQuery(householdId);
  const addressQuery = useEmergencyAddressQuery(householdId);

  const members = membersQuery.data?.members ?? [];
  const address = addressQuery.data ?? null;
  const loading = membersQuery.isLoading || addressQuery.isLoading;

  const me = members.find((m) => m.is_me);
  const isOwner = me?.role === "owner";
  const owner = members.find((m) => m.role === "owner");
  const familyPhones = members
    .filter((m) => !m.is_me)
    .map((m) => m.phone_number);
  const { stamp } = toAlertTimeParts(alert);

  const openSms = (recipients: string[], body?: string) => {
    Linking.openURL(buildSmsHref(recipients, body));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText
          type="body02"
          color={Palette.gray[300]}
          style={styles.loading}
        >
          불러오는 중…
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isOwner ? (
        <>
          <ActionButton
            Icon={Phone}
            label="119 영상통화 요청"
            onPress={() => openSms([EMERGENCY_NUMBER], VIDEO_CALL_REQUEST_BODY)}
          />
          <ActionButton
            Icon={Mail}
            label="119 문자 신고"
            disabled={!address}
            onPress={() =>
              address &&
              openSms(
                [EMERGENCY_NUMBER],
                buildReportBody(address, stamp, alert.sound),
              )
            }
          />
          <ActionButton
            Icon={Mail}
            label="가족 단체문자 전송"
            disabled={familyPhones.length === 0}
            onPress={() =>
              openSms(
                familyPhones,
                buildFamilyNoticeBody(stamp, alert.location),
              )
            }
          />
        </>
      ) : (
        <>
          <ActionButton
            Icon={Phone}
            label="119 전화 걸기"
            onPress={() => Linking.openURL(`tel:${EMERGENCY_NUMBER}`)}
          />
          {/* 보호자 → owner 문자는 템플릿 없이 문자앱만 연다 */}
          <ActionButton
            Icon={Mail}
            label={owner ? `${owner.display_name}에게 문자 전송` : "문자 전송"}
            onPress={() => openSms(owner ? [owner.phone_number] : [])}
          />
        </>
      )}
    </View>
  );
}

type ActionButtonProps = {
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function ActionButton({
  Icon,
  label,
  onPress,
  disabled = false,
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      <Icon size={ACTION_ICON_SIZE} color={Palette.gray[600]} />
      <ThemedText
        type="subtitle01"
        color={Palette.gray[600]}
        numberOfLines={1}
        style={styles.label}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.six,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.seven,
  },
  button: {
    width: "100%",
    height: ACTION_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: Palette.main[200],
    ...Shadow.shadow02,
  },
  buttonDisabled: {
    opacity: DISABLED_OPACITY,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  label: {
    flexShrink: 1,
  },
  loading: {
    textAlign: "center",
  },
});
