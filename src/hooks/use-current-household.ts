import { MOCK_CURRENT_HOUSEHOLD } from "@/mocks/household";
import type {
  CurrentHouseholdResponse,
  HouseholdRole,
} from "@/types/household";

interface CurrentHouseholdState {
  data: CurrentHouseholdResponse | null;
  role: HouseholdRole | null;
  isOwner: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * 명세 §5.1 GET /households/current 공유 훅 (웹 원본 hooks/useCurrentHousehold.ts).
 * owner/member 분기(§10.2)와 가구 표시 정보를 여러 화면에서 재사용한다.
 *
 * TODO: API 연동 시 목 대신 실제 조회 (react-query 등) 로 교체.
 */
export function useCurrentHousehold(): CurrentHouseholdState {
  const data = MOCK_CURRENT_HOUSEHOLD;
  const role = data.membership?.role ?? null;

  return { data, role, isOwner: role === "owner", loading: false, error: null };
}
