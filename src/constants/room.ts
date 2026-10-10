import type { ImageSourcePropType } from "react-native";

import { Palette } from "@/constants/theme";
import { type DeviceUiStatus, type RoomLabel } from "@/types/room";

export const roomImages: Record<RoomLabel, ImageSourcePropType> = {
  거실: require("@/assets/images/room-living.png"),
  안방: require("@/assets/images/room-bed.png"),
  화장실: require("@/assets/images/room-bath.png"),
  현관: require("@/assets/images/room-entrance.png"),
};

// 명세 §6.1 ui_status → 사용자용 상태 라벨·점 색상
// (Figma의 '신호 강함/보통'은 명세에 없는 값이라 ui_status 기준으로 대체)
export const deviceStatusMeta: Record<
  DeviceUiStatus,
  { label: string; dotColor: string }
> = {
  connected: { label: "연결됨", dotColor: Palette.success },
  pending: { label: "설정 반영 중", dotColor: Palette.yellow[200] },
  offline: { label: "연결 끊김", dotColor: Palette.red[200] },
  error: { label: "연결 오류", dotColor: Palette.red[200] },
  disabled_by_owner: { label: "연결 꺼짐", dotColor: Palette.gray[200] },
};

// 재연결 요청은 성공했지만 기기가 여전히 connected 가 아닐 때 보여줄 이유 안내 (토스트 두 줄)
export const reconnectNotice: Partial<Record<DeviceUiStatus, string>> = {
  offline: "기기가 응답하지 않아요.\n기기 전원과 네트워크를 확인해 주세요.",
  error:
    "기기가 설정을 반영하지 못했어요.\n기기 전원과 네트워크를 확인해 주세요.",
  pending: "설정을 반영하는 중이에요.\n잠시 후 다시 확인해 주세요.",
};
