import { useState } from "react";

import * as Clipboard from "expo-clipboard";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/http-error";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { CenteredMessage } from "@/components/ui/centered-message";
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
import { useDisplayNameMutation } from "@/hooks/use-display-name-mutation";
import { useInviteCodeQuery } from "@/hooks/use-invite-code-query";
import { useMembersQuery } from "@/hooks/use-members-query";
import { useRotateInviteCodeMutation } from "@/hooks/use-rotate-invite-code-mutation";
import { useHouseholdId } from "@/stores/session";
import { type HouseholdMember } from "@/types/household";
import { formatPhoneNumber } from "@/utils/phone";

const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;
/** 웹 tracking-[0.3em] (head02 28px 기준) */
const CODE_LETTER_SPACING = Typography.head02.fontSize * 0.3;
const COPIED_RESET_MS = 1500;

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
 * GET /members 목록, 표시 이름(별칭) 편집, owner 의 초대 코드 조회·재발급.
 */
export default function FamilySettingsScreen() {
  const householdId = useHouseholdId();
  const membersQuery = useMembersQuery(householdId);
  const [editing, setEditing] = useState<HouseholdMember | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const members = membersQuery.data?.members ?? [];
  const isOwner = members.some((m) => m.is_me && m.role === "owner");

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="가족 설정" />

      <ScrollView contentContainerStyle={styles.content}>
        {!householdId ? (
          <CenteredMessage inline>가구 연동이 필요합니다.</CenteredMessage>
        ) : membersQuery.isLoading ? (
          <CenteredMessage inline>불러오는 중…</CenteredMessage>
        ) : membersQuery.isError ? (
          <CenteredMessage inline tone="error">
            {getApiErrorMessage(
              membersQuery.error,
              "구성원 정보를 불러오지 못했어요.",
            )}
          </CenteredMessage>
        ) : (
          <View style={styles.list}>
            {members.map((member) => (
              <MemberCard
                key={member.user_id}
                member={member}
                onEdit={() => setEditing(member)}
              />
            ))}
          </View>
        )}

        {isOwner ? (
          <Button
            label="초대 코드 공유"
            variant="dark"
            onPress={() => setShowInvite(true)}
            style={styles.inviteButton}
          />
        ) : null}
      </ScrollView>

      {editing && householdId ? (
        <EditNameModal
          member={editing}
          householdId={householdId}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {householdId ? (
        <InviteCodeModal
          householdId={householdId}
          visible={showInvite}
          onClose={() => setShowInvite(false)}
        />
      ) : null}
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
  householdId,
  onClose,
}: {
  member: HouseholdMember;
  householdId: string;
  onClose: () => void;
}) {
  const displayNameMutation = useDisplayNameMutation();
  const [value, setValue] = useState(member.display_name);
  const [error, setError] = useState<string | null>(null);
  const trimmed = value.trim();
  const busy = displayNameMutation.isPending;

  // 성공하면 mutation 훅이 구성원 목록을 무효화하므로 닫기만 하면 된다
  const submit = async (displayName: string | null, fallback: string) => {
    setError(null);
    try {
      await displayNameMutation.mutateAsync({
        householdId,
        memberUserId: member.user_id,
        displayName,
      });
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e, fallback));
    }
  };

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
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={() => submit(null, "초기화하지 못했어요.")}
          style={({ pressed }) => [
            styles.textButton,
            (pressed || busy) && styles.textButtonPressed,
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

      {error ? (
        <ThemedText type="body03" color={Palette.red[200]}>
          {error}
        </ThemedText>
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
          loading={busy}
          onPress={() => submit(trimmed, "저장하지 못했어요.")}
          style={styles.modalAction}
        />
      </View>
    </ModalCard>
  );
}

function InviteCodeModal({
  householdId,
  visible,
  onClose,
}: {
  householdId: string;
  visible: boolean;
  onClose: () => void;
}) {
  const inviteQuery = useInviteCodeQuery(householdId, visible);
  const rotateMutation = useRotateInviteCodeMutation();
  const [rotateError, setRotateError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const invite = inviteQuery.data ?? null;
  const loading = inviteQuery.isLoading;
  const rotating = rotateMutation.isPending;
  const error =
    rotateError ??
    (inviteQuery.isError
      ? getApiErrorMessage(inviteQuery.error, "코드를 불러오지 못했어요.")
      : null);

  const copyCode = async () => {
    if (!invite) return;
    try {
      await Clipboard.setStringAsync(invite.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // 클립보드 접근이 막힌 환경에서는 무시
    }
  };

  // POST .../invite-code/rotate — 되돌릴 수 없음. 기존 코드 즉시 폐기.
  const rotate = async () => {
    setNotice(null);
    setRotateError(null);
    try {
      await rotateMutation.mutateAsync(householdId);
      setCopied(false);
      setNotice("새 코드를 발급했어요. 기존 코드는 더 이상 쓸 수 없어요.");
    } catch (e) {
      setRotateError(getApiErrorMessage(e, "재발급하지 못했어요."));
    }
  };

  return (
    <ModalCard visible={visible} onClose={onClose}>
      <ThemedText type="subtitle02" color={Palette.gray[600]}>
        초대 코드
      </ThemedText>
      <ThemedText type="body03" color={Palette.gray[300]}>
        가족에게 이 코드를 공유하세요.
        {invite ? ` ${formatExpiry(invite.expires_at)}` : ""}
      </ThemedText>

      <View style={styles.codeBox}>
        <ThemedText
          type="head02"
          color={Palette.gray[600]}
          style={styles.codeText}
        >
          {loading ? "…" : (invite?.invite_code ?? "------")}
        </ThemedText>
      </View>

      {error ? (
        <ThemedText
          type="body03"
          color={Palette.red[200]}
          style={styles.centerText}
        >
          {error}
        </ThemedText>
      ) : null}
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
        accessibilityState={{ disabled: rotating || loading }}
        disabled={rotating || loading}
        onPress={rotate}
        style={({ pressed }) => [
          styles.rotateButton,
          (pressed || rotating || loading) && styles.textButtonPressed,
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
          disabled={!invite}
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
