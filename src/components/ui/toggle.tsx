import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Palette, Radius, Shadow } from "@/constants/theme";

/** 웹 h-8 w-14 / 손잡이 h-6 w-6 top-1 left-1 → left-7 */
const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 32;
const KNOB_SIZE = 24;
const KNOB_INSET = 4;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;
const ANIMATION_DURATION = 200;
/** 잠긴 토글(허브 연결 · member 조회 전용)은 상태색은 읽히게 살짝만 흐린다 */
const DISABLED_OPACITY = 0.7;

export type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** 서버 응답 대기 중 표시 (낙관적 업데이트를 쓰지 않으므로 진행 중 피드백 제공) */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** 웹 원본 components/Toggle.tsx. 손잡이 이동은 웹의 transition-all 200ms 에 맞춘다. */
export function Toggle({
  checked,
  onChange,
  disabled = false,
  loading = false,
  style,
}: ToggleProps) {
  const isInactive = disabled || loading;
  // ref 가 아니라 state 로 들고 있어야 React Compiler 의 refs 규칙에 걸리지 않는다.
  // (Animated.Value 는 mutable 이라 재생성 없이 한 번만 만든다)
  const [position] = useState(() => new Animated.Value(checked ? 1 : 0));

  useEffect(() => {
    Animated.timing(position, {
      toValue: checked ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [checked, position]);

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, KNOB_TRAVEL],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={() => onChange(!checked)}
      style={[
        styles.track,
        { backgroundColor: checked ? Palette.main[200] : Palette.gray[200] },
        disabled && !loading && styles.dimmed,
        style,
      ]}
    >
      <Animated.View style={[styles.knob, { transform: [{ translateX }] }]}>
        {loading ? (
          <ActivityIndicator size="small" color={Palette.gray[300]} />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: Radius.pill,
    justifyContent: "center",
    flexShrink: 0,
  },
  knob: {
    position: "absolute",
    left: KNOB_INSET,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: Radius.pill,
    backgroundColor: Palette.white,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.shadow03,
  },
  dimmed: {
    opacity: DISABLED_OPACITY,
  },
});
