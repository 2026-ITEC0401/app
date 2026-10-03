import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// 스플래시는 index.tsx(게이트)가 진입 화면을 정한 뒤 직접 숨긴다.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />

            {/* 하단 탭 없는 화면 (시작·로그인·회원가입) */}
            <Stack.Screen
              name="(auth)/start"
              options={{ headerShown: false }}
            />

            {/* 하단 탭 있는 화면 (홈·알람·설정) */}
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
