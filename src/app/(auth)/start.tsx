import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Spacing } from "@/constants/theme";

const LOGO = require("@/assets/images/logo.png");
/** 웹 logo.svg 의 표시 크기 */
const LOGO_WIDTH = 294;
const LOGO_HEIGHT = 134;

/** 시작 화면 (웹 원본 pages/StartPage.tsx) */
export default function StartScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Image
          source={LOGO}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Hearo"
        />
        <ThemedText
          type="body01"
          color={Palette.gray[200]}
          style={styles.description}
        >
          집 안의 소리를 감지해{"\n"}가족과 실시간으로 함께 확인해요.
        </ThemedText>
      </View>
      <View style={styles.actions}>
        <Button
          label="로그인"
          variant="primary"
          onPress={() => router.push("/login")}
        />
        <Button
          label="회원가입"
          variant="outline-light"
          onPress={() => router.push("/signup")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.gray[400],
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.ten,
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  description: {
    textAlign: "center",
  },
  actions: {
    gap: Spacing.three,
  },
});
