//mocha -r ts-node/register  src/t/report.spec.ts
import { Report, ReportFactory } from '../src/lib/report';
import { Transaction } from '../src/lib/transaction';
import Options from '../src/lib/options';

import * as path from 'path';

import { expect, assert } from 'chai';
import 'mocha';

describe('ReportFactory', () => {
  it('can be initiated', () => {
    assert.ok(new ReportFactory());
  });

  it('creates report objects', () => {
    let rf = new ReportFactory({ date_format : Options.DATE_FORMAT_SANE });

    return rf.from_records([{
      'txn_date': '2017-01-01',
      'txn_amount_credit': '1000',
      'txn_amount_debit': 0,
      'acc_balance': '1000',
      'txn_desc': 'Some Transaction',
    }]).then(function() {
      let report = rf.report;

      assert.ok(report);
      expect(report).to.have.property('transactions').with.lengthOf(1);

      let transaction = report.transactions[0];
      assert.ok(transaction);
      expect(transaction).to.have.property('txn_amount_credit');
      expect(transaction.txn_amount_credit).to.equal(1000);
      expect(transaction).to.be.an.instanceOf(Transaction);
    });
  });

  it('Correctly filters', () => {
    let rf = new ReportFactory({ month: '201709', date_format: Options.DATE_FORMAT_SANE });
    return rf.from_records([
      {
        'txn_date': '2017-01-01',
        'txn_amount_credit': 1000,
        'txn_amount_debit': 0,
        'acc_balance': 1000,
        'txn_desc': 'January Transaction',
      },
      {
        'txn_date': '2017-09-01',
        'txn_amount_credit': 0,
        'txn_amount_debit': 100,
        'acc_balance': 900,
        'txn_desc': 'First September Transaction',
      },
      {
        'txn_date': '2017-09-02',
        'txn_amount_credit': 0,
        'txn_amount_debit': 50,
        'acc_balance': 850,
        'txn_desc': 'Second September Transaction',
      }
    ]).then(function() {
      let report = rf.report;

      expect(report).to.have.property('transactions').with.lengthOf(2);
      expect(!!report.transactions.find(function(txn){return txn.txn_desc==='First September Transaction';})).to.be.true;
      expect(!!report.transactions.find(function(txn){return txn.txn_desc==='Second September Transaction';})).to.be.true;
      expect(!!report.transactions.find(function(txn){return txn.txn_desc==='January Transaction';})).to.be.false;
    });
  });
  it('Can be configured to only keep unique transactions', () => {
    let rf = new ReportFactory({ month: '201701', date_format: Options.DATE_FORMAT_SANE, unique_only: false, });

    return rf.from_records([
      {
        'txn_date': '2017-01-01',
        'txn_amount_credit': 0,
        'txn_amount_debit': 1000,
        'acc_balance': 1000,
        'txn_desc': 'January Transaction',
      },
      {
        txn_date: '2017-01-01',
        txn_amount_credit: 0,
        txn_amount_debit: 1000,
        acc_balance: 1000,
        txn_desc: 'January Transaction',
      },
      {
        txn_date: '2017-01-02',
        txn_amount_credit: 0,
        txn_amount_debit: 150,
        acc_balance: 1000,
        txn_desc: 'January Transaction',
      }
    ]).then(function() {
      let report = rf.report;
      expect(report).to.have.property('transactions').with.lengthOf(3);
      expect(report.transactions[0].txn_date.getDate()).to.equal(new Date('2017-01-01').getDate());
      expect(report.transactions[1].txn_date.getDate()).to.equal(new Date('2017-01-01').getDate());
      expect(report.transactions[2].txn_date.getDate()).to.equal(new Date('2017-01-02').getDate());
      rf = new ReportFactory({ month: '201701', date_format: Options.DATE_FORMAT_SANE, unique_only: true, });

      return rf.from_records([
        {
          'txn_date': '2017-01-01',
          'txn_amount_credit': 0,
          'txn_amount_debit': 1000,
          'txn_desc': 'January Transaction',
        },
        {
          txn_date: '2017-01-01',
          txn_amount_credit: 0,
          txn_amount_debit: 1000,
          txn_desc: 'January Transaction',
        },
        {
          txn_date: '2017-01-02',
          txn_amount_credit: 0,
          txn_amount_debit: 150,
          txn_desc: 'January Transaction',
        }
      ]).then(function() {
        let report = rf.report;

        expect(report).to.have.property('transactions').with.lengthOf(2);
        expect(report.transactions[0].txn_date.getDate()).to.equal(new Date('2017-01-01').getDate());
        expect(report.transactions[1].txn_date.getDate()).to.equal(new Date('2017-01-02').getDate());

        rf = new ReportFactory({ month: '201701', date_format: Options.DATE_FORMAT_SANE, unique_only: true, });

        return rf.from_records([
          {
            'txn_date': '2017-01-01',
            'txn_amount_credit': 0,
            'txn_amount_debit': 1000,
            'acc_balance': 1000,
            'txn_desc': 'January Transaction',
          },
          {
            'txn_date': '2017-01-01',
            'txn_amount_credit': 0,
            'txn_amount_debit': 1000,
            'acc_balance':  1000,
            'txn_desc': 'January Transaction',
          },
          {
            'txn_date': '2017-01-01',
            'txn_amount_credit': 0,
            'txn_amount_debit': 1000,
            'acc_balance': 2000,
            'txn_desc': 'January Transaction',
          },
        ]).then(function() {
          let report = rf.report;
          expect(report).to.have.property('transactions').with.lengthOf(2);
          expect(report.transactions[0].acc_balance).to.equal(1000);
          expect(report.transactions[1].acc_balance).to.equal(2000);
        });
      });
    });
  });

  it ('can combine many sources', () => {
    const CSVPath = path.resolve(__dirname, 'data/fairfx-corp/')
    let rf = new ReportFactory({ date_format: Options.DATE_FORMAT_SANE, csv_path: CSVPath });

    return rf.add_records([{ 'txn_date': '2017-01-01', 'txn_amount_credit': 0, 'txn_amount_debit': 1000, 'txn_desc': 'Desc 1' }])
    .then(() => rf.add_records([{ 'txn_date': '2017-01-01', 'txn_amount_credit': 0, 'txn_amount_debit': 1000, 'txn_desc': 'Desc 2' }]))
    .then(() => rf.add_csvs([{ 'type': 'fairfx-corp', 'name': 'fairfx-corp.csv', }]))
    .then(() => {
      let report = rf.report;

      expect(report).to.have.property('transactions').with.lengthOf(4);
      expect(report.transactions[0].txn_desc).to.equal('Desc 1');
      expect(report.transactions[1].txn_desc).to.equal('Desc 2');
      expect(report.transactions[2].txn_desc).to.equal('AUTH: BURGER,,LONDON');
      expect(report.transactions[2].txn_amount_debit).to.equal(76.65);
    });
  });
});
