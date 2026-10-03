import axios from "axios";

/** 서버 공통 에러 바디 (명세 공통 규약). 웹 원본 lib/api.ts 의 ApiErrorBody. */
export interface ApiErrorBody {
  code: string;
  message: string;
  // 입력값 검증 실패 시 필드별 메시지 (예: 비밀번호 변경 §4.5)
  field_errors?: Record<string, string>;
  request_id?: string;
}

/**
 * 앱 전역 공통 API 에러. 화면/훅은 이 타입만 보고 상태코드·코드·메시지로 분기한다.
 * 필드명은 서버 바디(snake_case)를 그대로 따라 화면에서 매핑 없이 쓴다.
 */
export class ApiHttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly field_errors?: Record<string, string>;
  readonly request_id?: string;

  constructor(status: number, body: Partial<ApiErrorBody> = {}) {
    super(body.message ?? `API 요청 실패 (${status})`);
    this.name = "ApiHttpError";
    this.status = status;
    this.code = body.code ?? "UNKNOWN";
    this.field_errors = body.field_errors;
    this.request_id = body.request_id;
  }
}

/** axios 에러 → ApiHttpError 로 정규화. 응답 인터셉터에서 사용한다. */
export function toApiHttpError(error: unknown): ApiHttpError {
  if (error instanceof ApiHttpError) {
    return error;
  }
  // eslint-disable-next-line import/no-named-as-default-member
  if (axios.isAxiosError(error)) {
    // 응답 자체가 없음 = 네트워크 단절 · 타임아웃
    if (!error.response) {
      return new ApiHttpError(0, {
        code: "NETWORK_ERROR",
        message: "인터넷 연결을 확인해 주세요.",
      });
    }
    // 서버가 JSON 이 아닌 응답(502 HTML 등)을 준 경우 바디는 비운다
    const data: unknown = error.response.data;
    const body =
      typeof data === "object" && data !== null
        ? (data as Partial<ApiErrorBody>)
        : {};
    return new ApiHttpError(error.response.status, body);
  }
  if (error instanceof Error) {
    return new ApiHttpError(0, { message: error.message });
  }
  return new ApiHttpError(0, { message: "알 수 없는 오류가 발생했어요." });
}
