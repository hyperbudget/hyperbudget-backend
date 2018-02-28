//mocha -r ts-node/register  t/report.spec.ts
import { Transaction } from '../src/lib/transaction';
import { expect, assert } from 'chai';
import 'mocha';

import { SystemConfig } from '../src/lib/config/system';

describe('Transaction', () => {
  it('Can be constructed', () => {
    let transaction = new Transaction({
      txn_date            : '01/01/2017',
      txn_type            : 'DD',
      txn_amount_credit   : 0,
      txn_amount_debit    : 0,
      acc_balance         : 0,
    });
    assert.ok(transaction);
    expect(transaction).to.be.an.instanceOf(Transaction);
  });
  it('Keeps the given month by default', () => {
    let transaction = new Transaction({
      txn_date            : '01/01/2017',
      txn_type            : 'DEB',
      txn_amount_credit   : 0,
      txn_amount_debit    : 0,
      acc_balance         : 0,
    });
    expect(transaction.month).to.equal('201701');
    transaction = new Transaction({
      txn_date            : '31/01/2017',
      txn_type            : 'TFR',
      txn_amount_credit   : 0,
      txn_amount_debit    : 0,
      acc_balance         : 0,
      txn_desc            : 'Transfer to somebody else',
    });
    expect(transaction.month).to.equal('201701');
    transaction = new Transaction({
      txn_date            : '28/02/2017',
      txn_type            : 'CPT',
      txn_amount_credit   : 0,
      txn_amount_debit    : 0,
      acc_balance         : 0,
    });
    expect(transaction.month).to.equal('201702');
  });
  it('Changes the month for certain categories', () => {
    SystemConfig.config = {
      preferences: {
        categories: [
          {
            "name": "Rent",
            "category_rules": {
              "txn_type": {
                "rules": [
                  ["=", "SO"]
                ]
              }
            },
            "className": "cat-rent",
            "id": "rent"
          }, {
            "name": "Rent2",
            "category_rules": {
              "txn_type": {
                "rules": [
                  ["=", "SO"]
                ]
              },
              "txn_day": {
                "rules": [
                  ["<", 15]
                ]
              }
            },
            "txn_month_modifier": -1,
            "className": "cat-rent",
            "id": "rent-bring-back",
            "hidden_on_cat_list": true,
            "hidden_on_txn_list": true
          }
        ]
      }
    };

    let transaction = new Transaction({
      txn_date: '02/02/2017',
      txn_type: 'SO',
      txn_amount_credit: 0,
      txn_amount_debit: 775,
      acc_balance: 0,
      txn_desc: 'LANDLORD',
    });

    expect(transaction.categories.length).to.equal(2);
    expect(!!transaction.categories.find(function(n) { return n.name === 'Rent' }));
    expect(!!transaction.categories.find(function(n) { return n.name === 'Rent2' }));

    expect(transaction.month).to.equal('201701');
  });
});
