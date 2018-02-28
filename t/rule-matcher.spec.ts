import { expect } from 'chai';
import 'mocha';

import { RuleMatchMode } from '../src/lib/enums';
import { RuleMatcher } from '../src/lib/rule/matcher';

describe('Rule Parser', () => {
  let rbs = null;

  it('correctly parses a single rule', () => {
    expect(RuleMatcher.parse_number_rule(1000, [ '=', 1000 ])).to.be.true;
    expect(RuleMatcher.parse_number_rule(1000, [ '=', 1000.00 ])).to.be.true;
    expect(RuleMatcher.parse_number_rule(1000.00, [ '=', 1000 ])).to.be.true;
    expect(RuleMatcher.parse_number_rule(1000.00, [ '=', 1000.00 ])).to.be.true;
    expect(RuleMatcher.parse_number_rule(1000, [ '!=', 1000 ])).to.be.false;
    expect(RuleMatcher.parse_number_rule(1000.01, [ '!=', 1000 ])).to.be.true;
    expect(RuleMatcher.parse_number_rule(1000.01, [ '>', 1000 ])).to.be.true;
    expect(RuleMatcher.parse_number_rule(1000, [ '<', 1000 ])).to.be.false;
    expect(RuleMatcher.parse_number_rule(1000, [ '>', 1000 ])).to.be.false;
    expect(RuleMatcher.parse_number_rule(100, [ '<', 1000 ])).to.be.true;
    expect(RuleMatcher.parse_number_rule(1000, [ '>=', 1000 ])).to.be.true;
    expect(RuleMatcher.parse_number_rule(1000, [ '>=', 100 ])).to.be.true;
    expect(RuleMatcher.parse_number_rule(1000, [ '>', 100 ])).to.be.true;


    expect(RuleMatcher.parse_string_rule('hello', [ '=', 'HELLO' ])).to.be.true;
    expect(RuleMatcher.parse_string_rule('hello world', [ '!=', 'HELLO' ])).to.be.true;
    expect(RuleMatcher.parse_string_rule('hello world', [ '=~', 'HELLO' ])).to.be.true;
    expect(RuleMatcher.parse_string_rule('world', [ '!~', 'HELLO' ])).to.be.true;
  });

  it('correctly parses multiple rules', () => {
    expect(
      RuleMatcher.parse_number_rules(1000, {
        mode: RuleMatchMode.Strict,
        rules:
        [
          [ '=', 1000 ],
          [ '>', 100  ],
          [ '<', 3000 ]
        ]
      })
    ).to.be.true;
    expect(
      RuleMatcher.parse_number_rules(1000, {
        mode: RuleMatchMode.Strict,
        rules:
        [
          [ '=', 1000 ],
          [ '>', 1000 ],
          [ '<', 3000 ]
        ]
      })
    ).to.be.false;

    expect(
      RuleMatcher.parse_number_rules(1000, {
        mode: RuleMatchMode.Flex,
        rules:
        [
          [ '=', 1000 ],
          [ '<', 2000 ],
        ]
      })
    ).to.be.true;

    expect(
      RuleMatcher.parse_number_rules(1000, {
        mode: RuleMatchMode.Flex,
        rules:
        [
          [ '=', 1000 ],
          [ '<', 200  ],
        ]
      })
    ).to.be.true;

    expect(
      RuleMatcher.parse_number_rules(1000, {
        mode: RuleMatchMode.Flex,
        rules:
        [
          [ '=', 3000 ],
          [ '<', 200 ],
        ]
      })
    ).to.be.false;

    expect(RuleMatcher.parse_string_rules('hello world', {
      mode: RuleMatchMode.Strict,
      rules:
      [
        [ '=~', 'hello' ],
        [ '=~', 'world' ],
      ]
    })).to.be.true;

    expect(RuleMatcher.parse_string_rules('hello world', {
      mode: RuleMatchMode.Strict,
      rules:
      [
        [ '=~', 'hello' ],
        [ '!~', 'world' ],
      ]
    })).to.be.false;

    expect(RuleMatcher.parse_string_rules('hello world', {
      mode: RuleMatchMode.Flex,
      rules:
      [
        [ '=~', 'hello' ],
        [ '!~', 'world' ],
      ]
    })).to.be.true;

    expect(RuleMatcher.parse_string_rules('hello world', {
      mode: RuleMatchMode.Flex,
      rules:
      [
        [ '=' , 'hello world' ],
        [ '!~', 'world' ],
      ]
    })).to.be.true;

    expect(RuleMatcher.parse_string_rules('hello world', {
      mode: RuleMatchMode.Flex,
      rules:
      [
        [ '=', 'foo' ],
        [ '=', 'bar' ],
      ]
    })).to.be.false;
  });

  it ('errors with bad input', () => {
    expect (function() {
      RuleMatcher.parse_number_rule(100, ['>', NaN])
    }).to.throw(/not numeric/);
  });

});
