import { Category } from '@hyperbudget/hyperbudget-core';
import { Preference } from '../../types/preference';

type Configuration = {
  preferences: {
    categories: Category[],
  },
  app: {
    token_secret: string,
    token_expiry: number,
  },
}

export class SystemConfig {
  public static config: Configuration = {
     preferences: { categories: [] },
     app: {
      token_secret: '',
      token_expiry: 2700,
     },
  };
}
