import { useRouter } from "expo-router";
import { User } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { MenuGroup } from "@/components/ui/menu-group";
import { MenuRow } from "@/components/ui/menu-row";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { useAlarmSoundEnabled } from "@/hooks/use-alarm-sound-enabled";
import { useCurrentHouseholdQuery } from "@/hooks/use-current-household-query";
import { useDevicesQuery } from "@/hooks/use-devices-query";
import { useLogoutMutation } from "@/hooks/use-logout-mutation";
import { useMeQuery } from "@/hooks/use-me-query";
import { useHouseholdId } from "@/stores/session";

/** 웹 h-14 w-14 */
const AVATAR_SIZE = 56;
const AVATAR_ICON_SIZE = 28;

/**
 * 설정 탭 (웹 원본 pages/SettingsPage.tsx).
 * GET /me · GET /devices · GET /households/current 와 로컬 알림음 설정을 요약해 보여준다.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const householdId = useHouseholdId();
  const householdQuery = useCurrentHouseholdQuery();
  const meQuery = useMeQuery();
  const devicesQuery = useDevicesQuery(householdId);
  const { enabled: soundEnabled } = useAlarmSoundEnabled();
  const logoutMutation = useLogoutMutation();

  // 저장소를 아직 못 읽었으면 빈 값 (웹은 동기 읽기라 항상 값이 있었다)
  const alarmSoundLabel =
    soundEnabled === null ? "" : soundEnabled ? "소리 켬" : "소리 끔";
  const devices = devicesQuery.data?.devices;
  const deviceCount = devices
    ? {
        total: devices.length,
        connected: devices.filter((d) => d.ui_status === "connected").length,
      }
    : null;
  const deviceValue = deviceCount
    ? `${deviceCount.total}대 중 ${deviceCount.connected}대 연결`
    : "";
  const profileSubtitle = deviceCount
    ? `기기 ${deviceCount.connected}대 연결됨`
    : "";
  const householdName = householdQuery.data?.household?.name;

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
              {meQuery.data?.name ?? "사용자"}님
            </ThemedText>
            <ThemedText type="body02" color={Palette.gray[300]}>
              {householdQuery.isLoading
                ? ""
                : (householdName ?? profileSubtitle)}
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

        {/* 탈퇴는 비밀번호 확인과 owner 경고가 필요해 전용 화면으로 보낸다 */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/settings/withdraw")}
          style={({ pressed }) => [
            styles.withdraw,
            pressed && styles.logoutPressed,
          ]}
        >
          <ThemedText type="body03" color={Palette.gray[300]}>
            회원 탈퇴
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
  withdraw: {
    alignSelf: "center",
    marginTop: Spacing.three,
  },
});
