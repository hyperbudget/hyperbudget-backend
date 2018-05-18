import { Category } from '@hyperbudget/hyperbudget-core';
import { Preference } from '../../types/preference';
import { UserConfiguration } from '../../types/user-configuration';

export class SystemConfig {
  public static config: UserConfiguration = {
     preferences: { categories: [] }
  };
}
