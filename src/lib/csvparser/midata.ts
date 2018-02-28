import { CSVParser } from '../csvparser';

export default class MidataCSVParser extends CSVParser {
  protected srcName = 'Midata';

  protected txnMap =  {
    'Date'                : 'txn_date',
    'Type'                : 'txn_type',
    'Merchant/Description': 'txn_desc',
    'Debit/Credit'        : 'txn_amount',
    'Balance'             : 'acc_balance',
  };

  /* overriden to get rid of empty line and stupid 'overdraft limit' */
  protected readFile(csv_filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      super.readFile(csv_filename).then(function(input) {
        input = input.replace(/^\s+(.*)/m, '$1');
        input = input.replace(/^\n$/m, ''); /* Empty line */
        input = input.replace(/^$/m, ''); /* Empty line */
        input = input.replace(/^Arranged overdraft limit.*/m, ''); /* Stupidity */

        resolve(input);
      });
    });
  }

  parseCSVRecords(records: any[]): any[] {
    records = super.parseCSVRecords(records); 

    records.forEach(function(record, idx) {
      if (!record.txn_amount) {
        records.splice(idx, 1);
      } else {
        record.txn_amount = record.txn_amount.replace(/,/g, '');
        record.txn_amount = record.txn_amount.replace(/\u00A3/g, ''); /* £, yes, really! */
        record.acc_balance = record.acc_balance.replace(/\u00A3/g, '');
        record.acc_balance = +record.acc_balance;

        if (record.txn_amount >= 0) {
          record.txn_amount_credit = +record.txn_amount;
          record.txn_amount_debit = 0;
        } else {
          record.txn_amount_debit = -1 * record.txn_amount;
          record.txn_amount_credit = 0;
        }

        delete record.txn_amount;
      }
    }.bind(this));

    return records;
  }
}
