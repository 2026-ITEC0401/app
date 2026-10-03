import { useState } from "react";

import * as Clipboard from "expo-clipboard";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ModalCard } from "@/components/ui/modal-card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import {
  Palette,
  Radius,
  Shadow,
  Spacing,
  Typography,
} from "@/constants/theme";
import { MOCK_INVITE_CODE, MOCK_MEMBERS } from "@/mocks/household";
import {
  type HouseholdMember,
  type InviteCodeResponse,
} from "@/types/household";
import { formatPhoneNumber } from "@/utils/phone";

const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;
/** 웹 tracking-[0.3em] (head02 28px 기준) */
const CODE_LETTER_SPACING = Typography.head02.fontSize * 0.3;
const COPIED_RESET_MS = 1500;
/** 재발급 요청 흉내 (API 연동 전) */
const ROTATE_DELAY_MS = 600;
const INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// expires_at(UTC ISO) → "8월 25일 14:03까지 유효해요." (Asia/Seoul 표시)
function formatExpiry(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const seoul = new Date(date.getTime() + SEOUL_OFFSET_MS);
  const hh = String(seoul.getUTCHours()).padStart(2, "0");
  const mm = String(seoul.getUTCMinutes()).padStart(2, "0");
  return `${seoul.getUTCMonth() + 1}월 ${seoul.getUTCDate()}일 ${hh}:${mm}까지 유효해요.`;
}

/**
 * 가족 설정 (웹 원본 pages/FamilySettingsPage.tsx).
 *
 * TODO: API 연동 — GET /members, PATCH/DELETE display-name, GET/POST invite-code.
 * 지금은 목 구성원을 로컬에서만 수정한다.
 */
export default function FamilySettingsScreen() {
  const [members, setMembers] = useState<HouseholdMember[]>(MOCK_MEMBERS);
  const [editing, setEditing] = useState<HouseholdMember | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const isOwner = members.some((m) => m.is_me && m.role === "owner");

  const updateMember = (userId: string, patch: Partial<HouseholdMember>) => {
    setMembers((prev) =>
      prev.map((m) => (m.user_id === userId ? { ...m, ...patch } : m)),
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="가족 설정" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.list}>
          {members.map((member) => (
            <MemberCard
              key={member.user_id}
              member={member}
              onEdit={() => setEditing(member)}
            />
          ))}
        </View>

        {isOwner ? (
          <Button
            label="초대 코드 공유"
            variant="dark"
            onPress={() => setShowInvite(true)}
            style={styles.inviteButton}
          />
        ) : null}
      </ScrollView>

      {editing ? (
        <EditNameModal
          member={editing}
          onSave={(name) => {
            updateMember(editing.user_id, {
              display_name: name,
              display_name_is_custom: true,
            });
            setEditing(null);
          }}
          onReset={() => {
            updateMember(editing.user_id, {
              display_name: editing.profile_name,
              display_name_is_custom: false,
            });
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      ) : null}

      <InviteCodeModal
        visible={showInvite}
        onClose={() => setShowInvite(false)}
      />
    </SafeAreaView>
  );
}

function MemberCard({
  member,
  onEdit,
}: {
  member: HouseholdMember;
  onEdit: () => void;
}) {
  return (
    <View style={styles.memberCard}>
      <View style={styles.memberText}>
        <View style={styles.memberNameRow}>
          <ThemedText
            type="subtitle03"
            color={Palette.gray[600]}
            numberOfLines={1}
            style={styles.memberName}
          >
            {member.display_name}
          </ThemedText>
          {member.is_me ? (
            <View style={styles.meBadge}>
              <ThemedText type="label06" color={Palette.yellow[300]}>
                나
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText type="body02" color={Palette.gray[300]}>
          {formatPhoneNumber(member.phone_number)}
        </ThemedText>
      </View>

      {/* 본인 카드는 편집 불가 (§9). 서버가 is_me도 can_edit=true를 주지만
          본인 별칭은 UX상 의미가 없어 프론트에서 차단한다. */}
      {!member.is_me && member.can_edit_display_name ? (
        <Pressable
          accessibilityRole="button"
          onPress={onEdit}
          hitSlop={Spacing.two}
          style={({ pressed }) => pressed && styles.textButtonPressed}
        >
          <ThemedText type="label03" color={Palette.yellow[200]}>
            이름 편집
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

function EditNameModal({
  member,
  onSave,
  onReset,
  onClose,
}: {
  member: HouseholdMember;
  onSave: (name: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(member.display_name);
  const trimmed = value.trim();

  return (
    <ModalCard visible onClose={onClose}>
      <ThemedText type="subtitle02" color={Palette.gray[600]}>
        이름 편집
      </ThemedText>
      <ThemedText type="body03" color={Palette.gray[300]}>
        이 이름은 내 화면에서만 보여요.
      </ThemedText>

      <TextField
        label="표시 이름"
        value={value}
        onChangeText={setValue}
        maxLength={60}
        autoFocus
      />

      {member.display_name_is_custom ? (
        <Pressable
          accessibilityRole="button"
          onPress={onReset}
          style={({ pressed }) => [
            styles.textButton,
            pressed && styles.textButtonPressed,
          ]}
        >
          <ThemedText
            type="body03"
            color={Palette.gray[300]}
            style={styles.underline}
          >
            가입 시 이름으로 초기화
          </ThemedText>
        </Pressable>
      ) : null}

      <View style={styles.modalActions}>
        <Button
          label="취소"
          variant="outline-gray"
          size="small"
          onPress={onClose}
          style={styles.modalAction}
        />
        <Button
          label="저장"
          variant="dark"
          size="small"
          disabled={trimmed.length === 0}
          onPress={() => onSave(trimmed)}
          style={styles.modalAction}
        />
      </View>
    </ModalCard>
  );
}

function InviteCodeModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [invite, setInvite] = useState<InviteCodeResponse>(MOCK_INVITE_CODE);
  const [rotating, setRotating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(invite.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // 클립보드 접근이 막힌 환경에서는 무시
    }
  };

  // POST .../invite-code/rotate — 되돌릴 수 없음. 기존 코드 즉시 폐기.
  const rotate = () => {
    setRotating(true);
    setNotice(null);
    setTimeout(() => {
      const code = Array.from(
        { length: 6 },
        () =>
          INVITE_CODE_CHARS[
            Math.floor(Math.random() * INVITE_CODE_CHARS.length)
          ],
      ).join("");
      setInvite({ ...invite, invite_code: code });
      setCopied(false);
      setNotice("새 코드를 발급했어요. 기존 코드는 더 이상 쓸 수 없어요.");
      setRotating(false);
    }, ROTATE_DELAY_MS);
  };

  return (
    <ModalCard visible={visible} onClose={onClose}>
      <ThemedText type="subtitle02" color={Palette.gray[600]}>
        초대 코드
      </ThemedText>
      <ThemedText type="body03" color={Palette.gray[300]}>
        가족에게 이 코드를 공유하세요. {formatExpiry(invite.expires_at)}
      </ThemedText>

      <View style={styles.codeBox}>
        <ThemedText
          type="head02"
          color={Palette.gray[600]}
          style={styles.codeText}
        >
          {invite.invite_code}
        </ThemedText>
      </View>

      {notice ? (
        <ThemedText
          type="body03"
          color={Palette.gray[400]}
          style={styles.centerText}
        >
          {notice}
        </ThemedText>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: rotating }}
        disabled={rotating}
        onPress={rotate}
        style={({ pressed }) => [
          styles.rotateButton,
          (pressed || rotating) && styles.textButtonPressed,
        ]}
      >
        <ThemedText
          type="body03"
          color={Palette.gray[300]}
          style={styles.underline}
        >
          {rotating ? "재발급 중…" : "코드 재발급"}
        </ThemedText>
      </Pressable>

      <View style={styles.modalActions}>
        <Button
          label="닫기"
          variant="outline-gray"
          size="small"
          onPress={onClose}
          style={styles.modalAction}
        />
        <Button
          label={copied ? "복사됨!" : "복사"}
          variant="dark"
          size="small"
          onPress={copyCode}
          style={styles.modalAction}
        />
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  list: {
    gap: Spacing.three,
  },
  inviteButton: {
    marginTop: "auto",
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    ...Shadow.shadow02,
  },
  memberText: {
    flexShrink: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  memberName: {
    flexShrink: 1,
  },
  meBadge: {
    flexShrink: 0,
    borderRadius: Radius.pill,
    backgroundColor: Palette.main[100],
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  textButton: {
    alignSelf: "flex-start",
  },
  textButtonPressed: {
    opacity: 0.4,
  },
  underline: {
    textDecorationLine: "underline",
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  modalAction: {
    flex: 1,
    width: undefined,
  },
  codeBox: {
    alignItems: "center",
    borderRadius: Radius.medium,
    backgroundColor: Palette.gray[100],
    paddingVertical: Spacing.five,
  },
  codeText: {
    letterSpacing: CODE_LETTER_SPACING,
  },
  centerText: {
    textAlign: "center",
  },
  rotateButton: {
    alignSelf: "center",
  },
});
