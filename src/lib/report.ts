import * as path from 'path';

import { CSVParser } from './csvparser';
import HSBCCSVParser from './csvparser/hsbc';
import LloydsCSVParser from './csvparser/lloyds';
import FairFXCorpCSVParser from './csvparser/fairfxcorp';
import MidataCSVParser from './csvparser/midata';
import RBSCSVParser from './csvparser/rbs';

import { Transaction } from './transaction';

export interface Report {
  transactions: Transaction[];
  transactions_org: Transaction[];
};

class ReportImpl implements Report {
  transactions: Transaction[];
  transactions_org: Transaction[];

  constructor() {
    this.transactions = [];
    this.transactions_org = [];
  }
}

export class ReportFactory {
  private _report: ReportImpl;
  private options;

  constructor(options?) {
    this.options = options;
    this._report = new ReportImpl();
  }

  get report(): Report {
    return this._report;
  }

  set report(r) {
    this._report = r;
  }

  _csv_path(): Report {
    return this.options.csv_path || '../../csvs';
  }

  parseCSV(csv_filename, csv_type): Promise<any> {
    let csvparser: CSVParser;
    if (csv_type === 'lloyds') {
      csvparser = new LloydsCSVParser();
    } else if (csv_type === 'hsbc') {
      csvparser = new HSBCCSVParser();
    } else if (csv_type === 'fairfx-corp') {
      csvparser = new FairFXCorpCSVParser();
    } else if (csv_type === 'rbs') {
      csvparser = new RBSCSVParser();
    } else if (csv_type === 'midata') {
      csvparser = new MidataCSVParser();
    }

    //TODO: move this to a manager
    csv_filename = csv_filename.replace(/\//g, '-');
    csv_filename = path.resolve(__dirname, this._csv_path(), csv_filename);

    return csvparser.parseCSVFile(csv_filename);
  }

  from_records(records): Promise<any> {
    return this.add_records(records);
  }

  add_records(records): Promise<any> {
    let transactions: Transaction[] = [];
    let txnSeenIdentifierMap = {};

    records.forEach(function(record) {
      let txn:Transaction = new Transaction(record, this.options);

      //unique only
      if (!this.options.unique_only || !txnSeenIdentifierMap[txn.identifier]) {
        transactions.push(txn);
      }

      txnSeenIdentifierMap[txn.identifier] = true;
    }.bind(this));

    this.report.transactions = this.report.transactions.concat (transactions);

    if (this.options.month) {
      this.report.transactions_org = this.report.transactions.filter(txn => txn.org_month === this.options.month);
      this.report.transactions = this.report.transactions.filter(txn => txn.month === this.options.month);
    }

    return new Promise((resolve, reject) => resolve());
  }

  from_csvs(csvs): Promise<any> {
    return this.add_csvs(csvs);
  }

  add_csvs(csvs, idx=0, records=[]): Promise<any> {
    if (!csvs.length) {
      return Promise.resolve();
    }

    return this.add_csv(csvs[idx].name, csvs[idx].type).then(function(new_records) {
      records = records.concat(new_records);
      if (idx !== csvs.length-1) {
        return this.add_csvs(csvs, idx+1, records);
      } else {
        return this.add_records(records);
      }
    }.bind(this));
  }

  add_csv(csv_filename, c_type): Promise<any> {
    return this.parseCSV(
      csv_filename,
      c_type,
    );
  }
}

export default ReportFactory;
