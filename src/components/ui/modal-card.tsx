import { type ReactNode } from "react";

import { Modal, Pressable, StyleSheet } from "react-native";

import { Palette, Radius, Spacing } from "@/constants/theme";

/** 웹 max-w-80 */
const CARD_MAX_WIDTH = 320;
/** 웹 bg-black/40 */
const BACKDROP_COLOR = "rgba(0, 0, 0, 0.4)";

export type ModalCardProps = {
  visible: boolean;
  /** 배경을 누르면 호출. 카드 안쪽 터치는 전파되지 않는다. */
  onClose: () => void;
  children: ReactNode;
};

/**
 * 화면 가운데 뜨는 카드형 모달 (웹 원본 FamilySettingsPage 의 EditNameModal / InviteCodeModal 공통 틀).
 * 반투명 배경 + 흰 카드. 내용은 children 으로.
 */
export function ModalCard({ visible, onClose, children }: ModalCardProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* 빈 onPress 로 터치를 삼켜 배경의 onClose 가 안 불리게 한다 */}
        <Pressable style={styles.card} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.seven,
    backgroundColor: BACKDROP_COLOR,
  },
  card: {
    width: "100%",
    maxWidth: CARD_MAX_WIDTH,
    gap: Spacing.four,
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
    padding: Spacing.six,
  },
});
