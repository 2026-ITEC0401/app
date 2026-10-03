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

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
