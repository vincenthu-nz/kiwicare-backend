export interface AccessTokenInfo {
  accessToken: string;
  expiresIn: number;
  getTime: number;
  openid: string;
}

export interface AccessConfig {
  access_token: string;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
  expires_in: number;
}
