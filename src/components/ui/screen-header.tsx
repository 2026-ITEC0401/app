import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { Palette, Radius, Spacing } from "@/constants/theme";

import { ThemedText } from "../themed-text";

/** 웹 h-18 */
export const HEADER_HEIGHT = 72;
const BACK_BUTTON_SIZE = 40;
const BACK_ICON_SIZE = 28;

export type ScreenHeaderProps = {
  title: string;
  /** 뒤로 가기 화살표 노출 여부. 하단 탭으로 진입하는 화면은 false 로 사용 */
  showBackButton?: boolean;
};

/**
 * 화면 공용 헤더 (웹 원본 components/Header.tsx).
 *
 * 네이티브 스택 헤더 대신 화면 안에 직접 그린다 — 웹과 같은 높이·색·아이콘을
 * 그대로 재현하기 위해서다. 스택 스크린은 `headerShown: false` 로 둔다.
 * SafeAreaView 안, 스크롤 영역 위에 렌더한다.
 */
export function ScreenHeader({
  title,
  showBackButton = true,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showBackButton ? (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={Spacing.two}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <ChevronLeft size={BACK_ICON_SIZE} color={Palette.gray[500]} />
        </Pressable>
      ) : null}
      <ThemedText
        type="subtitle01"
        color={Palette.gray[500]}
        numberOfLines={1}
        style={styles.title}
      >
        {title}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    backgroundColor: Palette.gray[100],
  },
  backButton: {
    position: "absolute",
    left: Spacing.four,
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    // 타이틀 위에 올라와야 터치가 먹는다
    zIndex: 1,
  },
  // 웹의 hover:bg-gray-100 — 헤더 배경과 같은 색이라 눌림 피드백은 살짝 어둡게
  backButtonPressed: {
    backgroundColor: Palette.gray[200],
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
});
