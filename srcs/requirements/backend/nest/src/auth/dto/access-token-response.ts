export class AccessTokenResponse {
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
  readonly accessToken: string;
}
