//mocha -r ts-node/register  t/report.spec.ts
import { Transaction } from '../src/lib/transaction';
import { Categoriser } from '../src/lib/categoriser';

import { expect, assert } from 'chai';
import 'mocha';
import { RuleMatchMode } from '../src/lib/enums';
describe('Categoriser', () => {
  it('Can parse rules', () => {
    let transaction = new Transaction({
      txn_date            : '01/01/2017',
      txn_type            : 'DD',
      txn_desc            : 'MY DESCRIPTION',
      txn_amount_credit   : 0,
      txn_amount_debit    : 0,
      acc_balance         : 0,
    });

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'DESCRIPTION']],
        },
      })
    ).to.be.true;

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'DESCRIPTION']],
        },
        txn_amount_credit: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 0]],
        },
      })
    ).to.be.false;

    transaction = new Transaction({
      txn_date            : '01/01/2017',
      txn_type            : 'FPI',
      txn_desc            : 'SALARY',
      txn_amount_credit   : 3000,
      txn_amount_debit    : 0,
      acc_balance         : 3000,
    });

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'DESCRIPTION']],
        },
      })
    ).to.be.false;

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['=', 'SALARY']],
        },
      })
    ).to.be.true;

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['=~', 'SALARY']],
        },
        txn_amount_credit: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 2000]],
        },
      })
    ).to.be.true;

    transaction = new Transaction({
      txn_date            : '01/01/2017',
      txn_type            : 'FPI',
      txn_desc            : 'TFR J DOE',
      txn_amount_credit   : 2000,
      txn_amount_debit    : 0,
      acc_balance         : 2000,
    });

    expect(
      Categoriser.transaction_matches_rule(transaction, {
        txn_desc: {
          mode: RuleMatchMode.Strict,
          rules: [['!~', 'TFR J DOE']],
        },
        txn_amount_credit: {
          mode: RuleMatchMode.Strict,
          rules: [['>', 2000]],
        },
      })
    ).to.be.false;
  });
});
