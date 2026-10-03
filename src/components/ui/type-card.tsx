import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Palette, Radius, Spacing } from "@/constants/theme";

import { ThemedText } from "../themed-text";

const RADIO_SIZE = 24;
const RADIO_DOT_SIZE = 12;
const BORDER_WIDTH = 2;

export type TypeCardProps = {
  title: string;
  /** 줄바꿈은 "\n" 으로 (웹의 <br/>) */
  description: string;
  isSelected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/** 웹 원본 components/TypeCard.tsx — 라디오 버튼이 달린 선택 카드 */
export function TypeCard({
  title,
  description,
  isSelected,
  onPress,
  style,
}: TypeCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: isSelected ? Palette.main[200] : Palette.border },
        pressed && styles.cardPressed,
        style,
      ]}
    >
      <View
        style={[
          styles.radio,
          { borderColor: isSelected ? Palette.gray[500] : Palette.gray[200] },
        ]}
      >
        {isSelected ? <View style={styles.radioDot} /> : null}
      </View>

      <View style={styles.text}>
        <ThemedText type="head03" color={Palette.gray[500]}>
          {title}
        </ThemedText>
        <ThemedText type="label02" color={Palette.gray[300]}>
          {description}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
    padding: Spacing.five,
    borderRadius: Radius.large,
    borderWidth: BORDER_WIDTH,
    backgroundColor: Palette.white,
  },
  cardPressed: {
    opacity: 0.85,
  },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    flexShrink: 0,
    borderRadius: Radius.pill,
    borderWidth: BORDER_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: RADIO_DOT_SIZE,
    height: RADIO_DOT_SIZE,
    borderRadius: Radius.pill,
    backgroundColor: Palette.gray[500],
  },
  text: {
    flex: 1,
    gap: Spacing.three,
  },
});
