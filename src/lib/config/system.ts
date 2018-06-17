type Configuration = {
  app: {
    token_secret: string,
    token_expiry: number,
  },
}

export class SystemConfig {
  public static config: Configuration = {
     app: {
      token_secret: '',
      token_expiry: 2700,
     },
  };
}
