import { useEffect, useState } from "react";

import { Animated, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Shadow, Spacing } from "@/constants/theme";
import { hideToast, useToastStore } from "@/stores/toast";

/** 표시 유지 시간. Android ToastAndroid.SHORT(2초)보다 조금 길게 둔다 */
const VISIBLE_DURATION_MS = 2500;
const FADE_DURATION_MS = 200;
/** 하단 탭바(80) 위에 뜨도록 여백을 둔다. 탭이 없는 화면에서도 같은 높이를 유지한다 */
const BOTTOM_OFFSET = 96;
/** gray 500(#41444B)을 반투명으로 — 뒤 화면이 비치도록 */
const BACKGROUND_COLOR = "rgba(65, 68, 75, 0.6)";

/**
 * 토스트 호스트. 루트 레이아웃에 한 번만 두고, 표시는 stores/toast.ts 의 showToast() 로 요청한다.
 * 문구는 스토어가 들고 있고 여기서는 나타나고 사라지는 애니메이션만 맡는다.
 * 터치를 가로채지 않도록 pointerEvents 를 끈다.
 */
export function Toast() {
  const insets = useSafeAreaInsets();
  const { id, message } = useToastStore();
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!message) return;

    opacity.stopAnimation();
    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_DURATION_MS,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        // 사라진 뒤 스토어를 비우면 아래 return null 로 내려간다.
        // 그 사이 새 문구가 왔으면(finished=false) 그 문구의 효과가 이어받는다.
        if (finished) hideToast();
      });
    }, VISIBLE_DURATION_MS);

    return () => clearTimeout(timer);
    // id 가 바뀌면 같은 문구라도 다시 띄운다
  }, [id, message, opacity]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        { bottom: insets.bottom + BOTTOM_OFFSET, opacity },
      ]}
    >
      <ThemedText type="body02" color={Palette.white} style={styles.text}>
        {message}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.five,
    right: Spacing.five,
    alignItems: "center",
  },
  text: {
    textAlign: "center",
    borderRadius: Radius.large,
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    overflow: "hidden",
    ...Shadow.shadow02,
  },
});
