import { RuleMatchMode } from '../enums';
import { NumericMatchConfig, StringMatchConfig, NumberMatchOp, StringMatchOp } from '../../types/match-config';

export class RuleMatcher {

  static parse_number_rule(value: number, [ op, comparison ]: [ NumberMatchOp, number ]): boolean {
    if (isNaN(value)) {
      throw new Error(`parse_number_rule: given ${value} which is not numeric`);
    }

    if (isNaN(comparison)) {
      throw new Error(`parse_number_rule: given ${comparison} which is not numeric`);
    }

    switch (op) {
      case '=':
      return value === comparison;
      case '!=':
      return value !== comparison;
      case '>':
      return value > comparison;
      case '<':
      return value < comparison;
      case '>=':
      return value >= comparison;
      case '<=':
      return value <= comparison;
      default:
      throw new Error("no valid comparison given");
    }
  }

  static parse_number_rules(value: number, match_config: NumericMatchConfig): boolean {
    let match: boolean;

    let mode: RuleMatchMode = match_config.mode || RuleMatchMode.Strict;
    let rules: [NumberMatchOp, number][] = match_config.rules;

    if (mode === RuleMatchMode.Strict) {
      match = true;
    } else {
      match = false;
    }

    if (isNaN(value)) {
      throw new Error(`_parse_number_rules: ${value} is not a number`);
    }

    if (!Array.isArray(rules)) {
      console.error(rules);
      throw new Error(`_parse_number_rules: given ${rules} which is not an array`);
    }

    rules.forEach(function (rule: [NumberMatchOp, number]) {
      if (mode === RuleMatchMode.Strict) {
        match = match && RuleMatcher.parse_number_rule(value, rule);
      } else {
        match = match || RuleMatcher.parse_number_rule(value, rule);
      }
    });

    return match;
  }

  static parse_string_rule(value: string, [ op, comparison ]: [ StringMatchOp, string ]): boolean {
    value = value.toUpperCase();
    comparison = comparison.toUpperCase();

    switch (op) {
      case '=':
        return value === comparison;
      case '!=':
        return value !== comparison;
      case '=~':
        return !!value.match(new RegExp(comparison));
      case '!~':
        return !value.match(new RegExp(comparison));
      default:
        throw new Error("no valid comparison given");
    }
  }

  static parse_string_rules(value: string, match_config: StringMatchConfig): boolean {
    let match: boolean;

    let mode: RuleMatchMode = match_config.mode || RuleMatchMode.Strict;
    let rules: [StringMatchOp, string][] = match_config.rules;

    if (mode === RuleMatchMode.Strict) {
      match = true;
    } else {
      match = false;
    }

    if (!Array.isArray(rules)) {
      console.error(rules);
      throw new Error(`_parse_number_rules: given ${rules} which is not an array`);
    }

    rules.forEach(function (rule: [StringMatchOp, string]) {
      if (mode === RuleMatchMode.Strict) {
        match = match && RuleMatcher.parse_string_rule(value, rule);
      } else {
        match = match || RuleMatcher.parse_string_rule(value, rule);
      }
    });

    return match;
  }
}
