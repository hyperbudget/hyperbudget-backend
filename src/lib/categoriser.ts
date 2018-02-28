import { Transaction } from './transaction';

import { RuleMatcher } from './rule/matcher';
import { Category } from '../types/category';
import { CategoryRule } from '../types/category-rule';
import { NumericMatchConfig, StringMatchConfig } from '../types/match-config';
import { RuleMatchMode } from './enums';

import { SystemConfig } from './config/system';

import * as moment from 'moment';

export  class Categoriser {
  static categories(): Category[] {
    let config = SystemConfig.config;

    return config.preferences.categories;
  }

  static by_name(name: string): Category {
    let categories = Categoriser.categories();

    return categories.find(function(c: Category): boolean { return c.name === name });
  }

  static is_internal_transfer(txn: Transaction): boolean {
    return !!txn.categories.find((cat) => cat.id === 'tfr-pers');
  }

  static transaction_matches_rule(txn: Transaction, rule: CategoryRule): boolean {
    let match: boolean = true;

    ['txn_type', 'txn_desc', 'txn_src'].forEach(function(prop: string) {
      let match_config: StringMatchConfig = rule[prop];
      if (match_config) {
        match = match && RuleMatcher.parse_string_rules(txn[prop], match_config);
      }
    });

    ['txn_amount_credit','txn_amount_debit'].forEach(function(prop: string) {
      let match_config: NumericMatchConfig = rule[prop];

      if (match_config) {
        match = match && RuleMatcher.parse_number_rules(txn[prop], match_config);
      }
    });

    //special case for day
    if (rule['txn_day'] && txn.txn_date) {
      let match_config: NumericMatchConfig = rule['txn_day'];

      let day = moment(txn.txn_date).date();

      match = match && RuleMatcher.parse_number_rules(day, match_config);
    }

    return match;
  }

  static categorise(txn): Category[] {
    let categories = Categoriser.categories();
    let matched: Category[] = [];

    categories.forEach(function(category) {
      if (Categoriser.transaction_matches_rule(txn, category.category_rules)) {
        matched.push(category);
      }
    });

    return matched;
  }
}
