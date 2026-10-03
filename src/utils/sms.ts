import { Platform } from "react-native";

// sms:·tel: 딥링크는 플랫폼마다 구분자와 다중 수신자 표기가 다르다.
// iOS  : sms:번호&body=...            / 다중 sms:/open?addresses=번호,번호&body=...
// 그 외 : sms:번호?body=...            / 다중 sms:번호,번호?body=...
// (웹은 userAgent 로 판별했지만 RN 은 Platform.OS 로 바로 안다)

export function buildSmsHref(recipients: string[], body?: string): string {
  const to = recipients.join(",");
  const isMulti = recipients.length > 1;

  if (Platform.OS === "ios") {
    const base = isMulti ? `sms:/open?addresses=${to}` : `sms:${to}`;
    if (!body) return base;
    // 단일·다중 모두 iOS는 구분자로 &를 쓴다
    return `${base}&body=${encodeURIComponent(body)}`;
  }

  if (!body) return `sms:${to}`;
  return `sms:${to}?body=${encodeURIComponent(body)}`;
}
