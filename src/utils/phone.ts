// 서버가 내려주는 E.164(+8210...) 전화번호를 국내 표시 형식(010-...)으로 변환한다.
// 명세 §5.5·§8: 화면 표시용이며 tel:·sms: 링크에는 원본 E.164를 그대로 쓴다.
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");

  // 82(국가번호) → 0 으로 치환
  const local = digits.startsWith("82") ? `0${digits.slice(2)}` : digits;

  if (local.length === 11) {
    return `${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
  }

  // 예상 밖 형식은 원본을 그대로 반환한다
  return phone;
}
