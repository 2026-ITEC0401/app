import { useRouter } from "expo-router";
import { User } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { MenuGroup } from "@/components/ui/menu-group";
import { MenuRow } from "@/components/ui/menu-row";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useLogoutMutation } from "@/hooks/use-logout-mutation";
import { MOCK_DEVICES } from "@/mocks/devices";
import { MOCK_CURRENT_HOUSEHOLD, MOCK_ME } from "@/mocks/household";

/** 웹 h-14 w-14 */
const AVATAR_SIZE = 56;
const AVATAR_ICON_SIZE = 28;

/**
 * 설정 탭 (웹 원본 pages/SettingsPage.tsx).
 *
 * TODO: API 연동 — GET /me, GET /devices, GET /households/current.
 * TODO: 알림음 설정은 stores/preferences.ts 연동 후 실제 값으로.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();

  const alarmSoundLabel = "소리 켬";
  const deviceCount = {
    total: MOCK_DEVICES.length,
    connected: MOCK_DEVICES.filter((d) => d.ui_status === "connected").length,
  };
  const deviceValue = `${deviceCount.total}대 중 ${deviceCount.connected}대 연결`;
  const profileSubtitle = `기기 ${deviceCount.connected}대 연결됨`;
  const householdName = MOCK_CURRENT_HOUSEHOLD.household?.name;

  // POST /auth/logout — 서버 폐기가 실패해도 로컬 세션은 정리되므로 결과와 무관하게 로그인으로 보낸다
  const handleLogout = () => {
    if (logoutMutation.isPending) return;
    logoutMutation.mutate(undefined, {
      onSettled: () => router.replace("/login"),
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScreenHeader title="설정" showBackButton={false} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={AVATAR_ICON_SIZE} color={Palette.gray[300]} />
          </View>
          <View style={styles.profileText}>
            <ThemedText type="subtitle01" color={Palette.gray[600]}>
              {MOCK_ME.name}님
            </ThemedText>
            <ThemedText type="body02" color={Palette.gray[300]}>
              {householdName ?? profileSubtitle}
            </ThemedText>
          </View>
        </View>

        <MenuGroup>
          <MenuRow
            label="알림 설정"
            value={alarmSoundLabel}
            href="/settings/notifications"
          />
          <MenuRow
            label="기기 관리"
            value={deviceValue}
            href="/settings/devices"
          />
          <MenuRow
            label="소리 설정"
            value="긴급 4 · 일반 3"
            href="/settings/sound"
          />
        </MenuGroup>

        <MenuGroup>
          <MenuRow label="비밀번호 설정" href="/settings/password" />
          <MenuRow label="가족 설정" href="/settings/family" />
          <MenuRow label="개인정보 조회" href="/settings/profile" />
        </MenuGroup>

        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logout,
            pressed && styles.logoutPressed,
          ]}
        >
          <ThemedText type="body02" color={Palette.gray[300]}>
            로그아웃
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    ...Shadow.shadow02,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    flexShrink: 0,
    borderRadius: Radius.pill,
    backgroundColor: Palette.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    gap: Spacing.one,
  },
  logout: {
    alignSelf: "center",
    marginTop: Spacing.two,
  },
  logoutPressed: {
    opacity: 0.6,
  },
});
