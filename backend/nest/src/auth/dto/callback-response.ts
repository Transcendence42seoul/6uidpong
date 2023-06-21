export class CallbackResponse {
  constructor(is2FA: boolean, id: number, accessToken?: string) {
    this.is2FA = is2FA;
    this.id = id;
    this.accessToken = accessToken;
  }
  readonly is2FA: boolean;

  readonly id: number;

  readonly accessToken: string | undefined;
}
