import { Tabs } from "expo-router";
import { Bell, Home, Settings, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Palette, Spacing } from "@/constants/theme";

import { ThemedText } from "./themed-text";

type TabDef = { name: string; label: string; Icon: LucideIcon };

/** expo-router가 react-navigation을 내부 번들해 타입 경로가 불안정하므로, 쓰는 필드만 구조적으로 선언한다. */
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: {
      type: "tabPress";
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

/** 웹 원본 components/BottomNav.tsx — 알람 · 홈 · 설정 순서 */
const TABS: TabDef[] = [
  { name: "alerts", label: "알람", Icon: Bell },
  { name: "index", label: "홈", Icon: Home },
  { name: "settings", label: "설정", Icon: Settings },
];

/** 웹 h-20 (safe area 는 별도로 더한다) */
const TAB_BAR_HEIGHT = 80;
const TAB_ICON_SIZE = 28;

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <CustomTabBar {...(props as unknown as TabBarProps)} />
      )}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        // 웹의 pb-[env(safe-area-inset-bottom)] — 바 높이는 그대로 두고 아래로 늘린다
        {
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) {
          return null;
        }

        const focused = state.index === index;
        const color = focused ? Palette.gray[600] : Palette.gray[300];
        const { Icon } = tab;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <Icon size={TAB_ICON_SIZE} color={color} />
            <ThemedText type={focused ? "label03" : "label04"} color={color}>
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    backgroundColor: Palette.white,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
  },
  tabPressed: {
    opacity: 0.7,
  },
});
