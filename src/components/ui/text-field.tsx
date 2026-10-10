import { useState, type Ref } from "react";

import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { Palette, Radius, Spacing, Typography } from "@/constants/theme";

/** 웹 h-14 */
const INPUT_HEIGHT = 56;

export type TextFieldProps = TextInputProps & {
  /** 스크린리더용 이름. 웹 원본의 `<label class="sr-only">` 에 대응 (화면엔 안 보인다) */
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  ref?: Ref<TextInput>;
};

/**
 * 웹 원본 components/Input.tsx. 비밀번호는 `secureTextEntry` 로 쓴다.
 * 포커스 시 테두리가 main 200 으로 바뀐다.
 */
export function TextField({
  label,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ref,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={Palette.gray[200]}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.input, focused && styles.inputFocused, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: INPUT_HEIGHT,
    width: "100%",
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.medium,
    backgroundColor: Palette.background.elevated,
    paddingHorizontal: Spacing.four,
    color: Palette.black,
    ...Typography.body01,
    includeFontPadding: false,
  },
  inputFocused: {
    borderColor: Palette.main[200],
  },
});
