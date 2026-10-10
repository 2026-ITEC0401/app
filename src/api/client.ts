import axios, { type InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

import { API_ENDPOINTS } from "@/api/endpoints";
import { ApiHttpError, toApiHttpError } from "@/api/http-error";
import { clearSession } from "@/stores/session";
import type { AuthTokens } from "@/types/auth";
import { resetTo } from "@/utils/navigation";

/**
 * [환경변수] Expo 는 번들 타임에 EXPO_PUBLIC_ 접두사가 붙은 값만 문자열로 치환한다.
 * process.env.EXPO_PUBLIC_API_BASE_URL 처럼 "통째로" 써야 하고, 동적 키 접근은 undefined 가 된다.
 * .env 를 고치면 Metro 캐시 때문에 반영이 안 된다 → `npx expo start -c` 로 재시작.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export const ACCESS_TOKEN_KEY = "hearo.accessToken";
export const REFRESH_TOKEN_KEY = "hearo.refreshToken";

const REQUEST_TIMEOUT_MS = 10_000;

// axios 는 default export 에 create 를 노출하는데, import/no-named-as-default-member 가
// 이를 오탐으로 잡는다. axios.create 는 정식 사용법이라 이 줄만 규칙을 끈다.
// eslint-disable-next-line import/no-named-as-default-member
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

/**
 * 요청마다 SecureStore 에서 토큰을 읽어 Authorization 헤더에 넣는다.
 * SecureStore 는 전부 비동기(Promise)라 인터셉터를 async 로 선언한다.
 */
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // dev 전용 요청 로깅. adb logcat -s ReactNativeJS:V 로 확인. 프로덕션 번들엔 포함되지 않음.
  if (__DEV__) {
    console.info(`[API →] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

/**
 * refresh 토큰으로 access 를 재발급한다 (POST /auth/refresh, 웹 원본 lib/api.ts refreshTokens).
 * 인터셉터 재귀를 피하려고 raw axios 를 쓴다. 새 토큰 두 개가 모두 바디로 온다.
 */
async function refreshTokens(): Promise<void> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("refresh 토큰 없음");
  }
  const res = await axios.post<AuthTokens>(
    `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
    { refresh_token: refreshToken },
    {
      headers: { "Content-Type": "application/json" },
      timeout: REQUEST_TIMEOUT_MS,
    },
  );
  const { access_token, refresh_token } = res.data ?? {};
  // 둘 다 온 경우만 성공 처리 (옛 토큰 유지 방지)
  if (!access_token || !refresh_token) {
    throw new Error("재발급 응답에 토큰이 없음");
  }
  await setTokens(access_token, refresh_token);
}

// 동시 401 이 여러 번 재발급을 부르지 않도록 진행 중 Promise 를 공유 (single-flight).
let refreshPromise: Promise<void> | null = null;

// 이 경로들의 401 은 자격 증명 오류지 세션 만료가 아니므로 재발급을 시도하지 않는다.
const NO_REFRESH_PATHS: readonly string[] = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.signup,
  API_ENDPOINTS.auth.refresh,
];

/**
 * 응답 인터셉터: 401 이면 refresh 토큰으로 1회 재발급 후 원 요청을 재시도한다.
 * 재발급 실패 시 토큰·세션을 정리하고 로그인 화면으로 보낸다 (웹 원본의 window.location 대체).
 * 그 외 에러는 공통 ApiHttpError 로 정규화한다.
 */
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.info(`[API ←] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const config = error?.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status: number | undefined = error?.response?.status;
    const url = config?.url ?? "";

    if (__DEV__) {
      const body = error?.response?.data as { message?: string } | undefined;
      console.info(`[API ✗] ${status ?? "-"} ${url}`, body?.message ?? "");
    }

    const skip = NO_REFRESH_PATHS.some((path) => url.includes(path));

    if (status === 401 && config && !config._retry && !skip) {
      config._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshTokens();
        await refreshPromise;
        refreshPromise = null;
        return apiClient(config);
      } catch {
        refreshPromise = null;
        await Promise.all([clearTokens(), clearSession()]);
        // 스택을 비우고 로그인으로. replace 만 하면 뒤로가기로 인증이 필요한 화면에 되돌아간다
        resetTo("/login");
        return Promise.reject(
          new ApiHttpError(401, {
            code: "UNAUTHORIZED",
            message: "다시 로그인해 주세요.",
          }),
        );
      }
    }

    return Promise.reject(toApiHttpError(error));
  },
);

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

/** 로그아웃 · 세션 만료 · 비밀번호 변경에서 두 토큰을 함께 정리할 때 사용. */
export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
