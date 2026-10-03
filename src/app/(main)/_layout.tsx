import { Tabs } from "expo-router";
import { Bell, Home, Settings } from "lucide-react-native";

/**
 * 하단 탭 (웹 BottomNav: 알람 · 홈 · 설정).
 *
 * TODO(3단계): 디자인 토큰 생성 후 커스텀 tabBar(app-tabs.tsx)로 교체
 */
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="alerts"
        options={{
          title: "알람",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
