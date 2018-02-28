import HSBCCSVParser from '../src/lib/csvparser/hsbc';

import { expect, assert } from 'chai';
import 'mocha';

describe('HSBCCSVParser', () => {
  it('can be initiated', () => {
    assert.ok(new HSBCCSVParser());
  });
  let records: any[] = new HSBCCSVParser().parseCSVRecords(
    [
      {
        'Transaction Date': '2017-01-01',
        'Transaction Description': 'XXX',
        'Transaction Amount': "100",
      },
      {
        'Transaction Date': '2017-01-02',
        'Transaction Description': 'XXX2',
        'Transaction Amount': "-200",
      },
    ]);

    it('Correctly parses records', () => {
      assert.ok(records);
      expect(records.length).to.equal(2);

      let record = records[0];
      expect(record.txn_date).to.equal('2017-01-01');
      expect(record.txn_desc).to.equal('XXX');
      expect(record.txn_amount_credit).to.equal(100);
      expect(record.txn_amount_debit).to.equal(0);

      record = records[1];
      expect(record.txn_date).to.equal('2017-01-02');
      expect(record.txn_desc).to.equal('XXX2');
      expect(record.txn_amount_credit).to.equal(0);
      expect(record.txn_amount_debit).to.equal(200);
  });
});
