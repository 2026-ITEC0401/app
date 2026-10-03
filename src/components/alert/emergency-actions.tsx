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
import { MOCK_EMERGENCY_ADDRESS, MOCK_MEMBERS } from "@/mocks/household";
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
 *
 * TODO: API 연동 시 MOCK_MEMBERS / MOCK_EMERGENCY_ADDRESS 를
 * getMembers / getEmergencyAddress 응답으로 교체한다.
 */
export function EmergencyActions({ alert }: EmergencyActionsProps) {
  const members = MOCK_MEMBERS;
  const address = MOCK_EMERGENCY_ADDRESS;

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
});
