import { RuleMatchMode } from "@hyperbudget/hyperbudget-core/dist/lib/enums";

export const validate_category_rule = (input, callback) => {
  if (input.mode !== undefined && input.mode !== RuleMatchMode.Strict && input.mode !== RuleMatchMode.Flex) {
    return false;
  }

  if (!(input.rules && Array.isArray(input.rules))) {
    return false;
  }

  for (var i = 0; i < input.rules.length; i++) {
    let rule: any[] = input.rules[i];

    if (!(rule && Array.isArray(rule) && rule.length == 2)) {
      return false;
    }

    if (!callback(rule)) {
      return false;
    }
  }

  return true;
}

export const validate_category_number_rule = (input) => {
  return validate_category_rule(input, (rule: any[]) => {
    if (!rule[0].match(/=|\!=|\>|\<|\>=|\<=/)) {
      return false;
    }

    if (!(''+rule[1]).match(/\d+/)) {
      return false;
    }

    return true;
  });
}

export const validate_category_string_rule = (input) => {
  return validate_category_rule(input, (rule: any[]) => {
    if (!rule[0].match(/=|\!=|=\~|\!\~/)) {
      return false;
    }

    return true;
  });
}