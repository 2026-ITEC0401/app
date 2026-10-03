import { QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/api/query-client";

// 스플래시는 index.tsx(게이트)가 진입 화면을 정한 뒤 직접 숨긴다.
SplashScreen.preventAutoHideAsync();

/**
 * 루트 스택.
 *
 * 모든 화면이 웹과 같은 헤더(components/ui/screen-header.tsx)를 화면 안에 직접
 * 그리므로 네이티브 스택 헤더는 전부 끈다. 라우트 목록은 src/app 파일 구조가 곧 정의다:
 *
 *   index                 게이트 → /start
 *   (auth)/start·login    시작 · 로그인
 *   (auth)/signup/*       가입 유형 · 폼(new/family) · 초대 코드 · 가구 연동 · 주소
 *   (main)/*              하단 탭 (알람 · 홈 · 설정)
 *   alerts/[id]           알림 상세
 *   settings/*            설정 하위 (기기 · 기기 상세 · 가족 · 알림 · 소리 · 비밀번호 · 개인정보)
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={DefaultTheme}>
            {/* 라이트 모드 고정 — 바탕이 어두운 화면(시작·홈)만 개별로 light 를 올린다 */}
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
