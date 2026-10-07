import { TERMS, type TermContentCode } from "@/constants/terms";

import { TermsModal } from "./terms-modal";

export type TermContentModalProps = {
  /** 띄울 약관 코드. null 이면 닫힘 */
  code: TermContentCode | null;
  onClose: () => void;
};

/**
 * 약관·개인정보 처리방침 전문 모달 (C 레퍼런스 components/ui/term-content-modal.tsx).
 * 화면은 `useState<TermContentCode | null>` 하나만 들고 코드를 넘기면 된다.
 */
export function TermContentModal({ code, onClose }: TermContentModalProps) {
  const term = code ? TERMS[code] : null;
  return (
    <TermsModal
      visible={term !== null}
      title={term?.title ?? ""}
      caption={term ? `시행일: ${term.effectiveDate}` : undefined}
      body={term?.body ?? ""}
      onClose={onClose}
    />
  );
}
