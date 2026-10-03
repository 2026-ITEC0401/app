import { Children, Fragment, type ReactNode } from "react";

import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { Palette, Radius, Shadow } from "@/constants/theme";

export type MenuGroupProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * 설정 메뉴 묶음 카드 (웹 원본 pages/SettingsPage.tsx 의 MenuGroup).
 * 웹의 `divide-y` 대신 자식 사이에 구분선을 직접 끼워 넣는다.
 */
export function MenuGroup({ children, style }: MenuGroupProps) {
  return (
    <View style={[styles.group, style]}>
      {Children.toArray(children).map((child, index) => (
        <Fragment key={index}>
          {index > 0 ? <View style={styles.divider} /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
    overflow: "hidden",
    ...Shadow.shadow02,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
  },
});
