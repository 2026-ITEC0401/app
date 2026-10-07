import { X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Palette, Radius, Spacing } from "@/constants/theme";

import { ThemedText } from "../themed-text";
import { Button } from "./button";

const CLOSE_ICON_SIZE = 22;
/** 화면 높이의 80% 까지만 — 본문이 길면 안에서 스크롤 */
const SHEET_MAX_HEIGHT = "80%";
/** 웹 bg-black/40 과 같은 톤 (ModalCard 와 동일) */
const BACKDROP_COLOR = "rgba(0, 0, 0, 0.4)";

export type TermsModalProps = {
  visible: boolean;
  title: string;
  /** 본문 전문. 줄바꿈 그대로 표시한다 */
  body: string;
  /** 제목 아래 보조 줄 (예: "시행일: 2026년 10월 5일") */
  caption?: string;
  onClose: () => void;
};

/**
 * 긴 전문을 읽는 모달 — 제목 + 스크롤 본문 + [닫기] (C 레퍼런스 components/ui/terms-modal.tsx).
 * 약관·개인정보 처리방침·오픈소스 라이선스 전문 보기에 함께 쓴다.
 *
 * ModalCard 와 달리 시트를 Pressable 로 감싸지 않는다 — 조상 터치러블이 Android 에서
 * ScrollView 의 드래그 responder 를 가로채 스크롤이 끊기는 일이 있어, 배경 닫기 타겟은
 * 시트 뒤의 형제 레이어(absoluteFill)로 둔다.
 */
export function TermsModal({
  visible,
  title,
  body,
  caption,
  onClose,
}: TermsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessible={false}
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText type="subtitle02" color={Palette.gray[600]}>
                {title}
              </ThemedText>
              {caption ? (
                <ThemedText type="body03" color={Palette.gray[300]}>
                  {caption}
                </ThemedText>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={Spacing.two}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <X size={CLOSE_ICON_SIZE} color={Palette.gray[500]} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="body02" color={Palette.gray[500]}>
              {body}
            </ThemedText>
          </ScrollView>

          <Button label="닫기" variant="dark" size="small" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.four,
    backgroundColor: BACKDROP_COLOR,
  },
  sheet: {
    maxHeight: SHEET_MAX_HEIGHT,
    gap: Spacing.four,
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.six,
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  // 제목이 길어 줄바꿈돼도 X 아이콘을 밀지 않도록 가용 폭 안에서 접히게 한다
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  // 본문이 짧을 땐 콘텐츠만큼만(hug), 길 땐 시트의 maxHeight 안에서 줄어들어 스크롤이 생기도록.
  // RN 은 flex 자식의 flexShrink 기본값이 0 이라 이게 없으면 ScrollView 가 콘텐츠 전체 높이로 커진다.
  bodyScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  bodyContent: {
    paddingBottom: Spacing.two,
  },
});
