import MidataCSVParser from '../src/lib/csvparser/midata';

import { expect, assert } from 'chai';
import 'mocha';

import * as path from 'path';

describe('MidataCSVParser', () => {
  it('can be initiated', () => {
    assert.ok(new MidataCSVParser());
  });
  it('Correctly parses records', () => {
    new MidataCSVParser().parseCSVFile(
      path.resolve(__dirname, 'data/midata/midata3801.csv')
    ).then(
      function(records) {
        assert.ok(records);
        expect(records.length).to.equal(9);

        let record = records[0];
        expect(record.txn_date).to.equal('27/11/2017');
        expect(record.txn_type).to.equal('VIS');
        expect(record.txn_desc).to.match(/^Just Eat/);
        expect(record.txn_amount_debit).to.equal(14.24);
        expect(record.txn_amount_credit).to.equal(0);
        expect(record.acc_balance).to.equal(17.97);
    });
  });
});
