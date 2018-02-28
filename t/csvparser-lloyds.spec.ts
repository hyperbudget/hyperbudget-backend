import LloydsCSVParser from '../src/lib/csvparser/lloyds';

import { expect, assert } from 'chai';
import 'mocha';

describe('LloydsCSVParser', () => {
  it('can be initiated', () => {
    assert.ok(new LloydsCSVParser());
  });
  let records = new LloydsCSVParser().parseCSVRecords(
    [{
      'Transaction Date': '2017-01-01',
      'Transaction Type': 'DD',
      'Sort Code': '11-12-34',
      'Account Number': '12345678',
      'Transaction Description': 'XXX',
      'Debit Amount': 100,
      'Credit Amount': 200,
      'Balance': 2000,
    }]);
    it('Correctly parses records', () => {
      assert.ok(records);
      expect(records.length).to.equal(1);

      let record = records[0];
      expect(record.txn_date).to.equal('2017-01-01');
      expect(record.txn_type).to.equal('DD');
      expect(record.acc_sortcode).to.equal('11-12-34');
      expect(record.acc_number).to.equal('12345678');
      expect(record.txn_desc).to.equal('XXX');
      expect(record.txn_amount_credit).to.equal(200);
      expect(record.txn_amount_debit).to.equal(100);
      expect(record.acc_balance).to.equal(2000);
    });
});
