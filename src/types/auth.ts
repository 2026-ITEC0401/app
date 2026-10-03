export interface AuthUser {
  user_id: string;
  login_id: string;
  name: string;
  phone_number: string;
  account_type: "household_owner" | "family_member";

  // household_link_status가 "unlinked"이면 null
  household_id: string | null;
  role: "owner" | "member" | null;
  household_link_status: "linked" | "unlinked";
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// 명세 §4.2 POST /auth/login
export interface LoginRequest {
  login_id: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// 명세 §4.5 PATCH /me/password
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
