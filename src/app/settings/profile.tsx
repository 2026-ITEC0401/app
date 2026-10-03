import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { MOCK_ME } from "@/mocks/household";
import { type AuthUser } from "@/types/auth";
import { formatPhoneNumber } from "@/utils/phone";

const ACCOUNT_TYPE_LABEL: Record<AuthUser["account_type"], string> = {
  household_owner: "가구 소유자",
  family_member: "가족·보호자",
};

function formatJoinedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * 개인정보 조회 (웹 원본 pages/ProfilePage.tsx).
 * 명세 §4.4 GET /me — 조회 전용. 이름·전화번호 수정 API는 명세에 없어 수정 기능 없음.
 *
 * TODO: API 연동 — GET /me. 로딩 · 에러는 CenteredMessage 로.
 */
export default function ProfileScreen() {
  const me = MOCK_ME;

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="개인정보 조회" />

      <View style={styles.content}>
        <View style={styles.card}>
          <ProfileRow label="로그인 아이디" value={me.login_id} />
          <ProfileRow label="이름" value={me.name} />
          <ProfileRow
            label="휴대폰 번호"
            value={formatPhoneNumber(me.phone_number)}
          />
          <ProfileRow
            label="계정 유형"
            value={ACCOUNT_TYPE_LABEL[me.account_type]}
            last={!me.created_at}
          />
          {me.created_at ? (
            <ProfileRow
              label="가입일"
              value={formatJoinedDate(me.created_at)}
              last
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

/** 알림 상세의 InfoRow 와 글자 크기·여백이 달라 화면 안에 따로 둔다 */
function ProfileRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowDivided]}>
      <ThemedText type="body01" color={Palette.gray[300]}>
        {label}
      </ThemedText>
      <ThemedText type="body01" color={Palette.gray[600]}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  card: {
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.one,
    ...Shadow.shadow02,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.four,
  },
  rowDivided: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
});
