import { validate_category_number_rule, validate_category_string_rule } from '../src/lib/validator';

import { expect, assert } from 'chai';
import 'mocha';
import { RuleMatchMode } from '@hyperbudget/hyperbudget-core/dist/lib/enums';

describe('Validator', () => {
  it('validates category rules', () => {

    expect (validate_category_number_rule({
      mode: RuleMatchMode.Flex,
      rules: [
        ['=', 10]
      ]
    })).to.be.true

    expect (validate_category_number_rule({
      mode: RuleMatchMode.Strict,
      rules: [
        ['wat', 10]
      ]
    })).to.be.false

    expect (validate_category_string_rule({
      mode: RuleMatchMode.Flex,
      rules: [
        ['=', 10]
      ]
    })).to.be.true

    expect (validate_category_string_rule({
      mode: RuleMatchMode.Strict,
      rules: [
        ['=', '10']
      ]
    })).to.be.true

    expect (validate_category_string_rule({
      mode: 0,
      rules: [
        ['=', '10']
      ]
    })).to.be.false

    expect (validate_category_string_rule({
      rules: [
        ['=', '10']
      ]
    })).to.be.true
  });
});