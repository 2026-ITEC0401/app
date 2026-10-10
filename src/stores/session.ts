import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

/**
 * 로그인 세션 중 가구 식별자 (웹 원본 lib/auth.ts 의 household_id).
 *
 * 웹은 localStorage 를 동기로 읽었지만 SecureStore 는 전부 비동기라, 앱 진입 게이트
 * (app/index.tsx) 에서 한 번 hydrate 해 두고 화면은 스토어를 동기로 읽는다.
 * 토큰 자체는 api/client.ts 가 요청마다 SecureStore 에서 직접 읽으므로 여기 두지 않는다.
 */
const HOUSEHOLD_ID_KEY = "hearo.householdId";

interface SessionState {
  householdId: string | null;
  // hydrateSession 완료 여부. false 면 householdId 가 아직 저장소와 다를 수 있다.
  hydrated: boolean;
}

export const useSessionStore = create<SessionState>(() => ({
  householdId: null,
  hydrated: false,
}));

/** 저장소 → 스토어. 앱 진입 시 1회. 읽기 실패는 "가구 없음"으로 취급한다. */
export async function hydrateSession(): Promise<void> {
  let householdId: string | null = null;
  try {
    householdId = await SecureStore.getItemAsync(HOUSEHOLD_ID_KEY);
  } catch (error) {
    console.warn("가구 식별자를 읽지 못했습니다.", error);
  }
  useSessionStore.setState({ householdId, hydrated: true });
}

export async function setHouseholdId(householdId: string): Promise<void> {
  useSessionStore.setState({ householdId });
  try {
    await SecureStore.setItemAsync(HOUSEHOLD_ID_KEY, householdId);
  } catch (error) {
    console.warn("가구 식별자를 저장하지 못했습니다.", error);
  }
}

export async function clearSession(): Promise<void> {
  useSessionStore.setState({ householdId: null });
  try {
    await SecureStore.deleteItemAsync(HOUSEHOLD_ID_KEY);
  } catch (error) {
    console.warn("가구 식별자를 지우지 못했습니다.", error);
  }
}

/** 훅 밖(API 함수 등)에서 동기로 읽을 때 */
export function getHouseholdId(): string | null {
  return useSessionStore.getState().householdId;
}

/** 화면에서 구독할 때. 값이 바뀌면 리렌더된다. */
export function useHouseholdId(): string | null {
  return useSessionStore((state) => state.householdId);
}
