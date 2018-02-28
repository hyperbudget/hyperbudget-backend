import { CSVParser } from '../csvparser';
import { HSBCTransTypes } from '../consts/transactiontypes/hsbc';

export default class HSBCCSVParser extends CSVParser {
  protected srcName = 'HSBC';

  protected txnMap =  {
    'Transaction Date'       : 'txn_date',
    'Transaction Description': 'txn_desc',
    'Transaction Amount'     : 'txn_amount',
  };

  protected readFile(csv_filename: string): Promise<any> {
    return super.readFile(csv_filename)
    .then(function(input) {
      input = "Transaction Date,Transaction Description,Transaction Amount\r\n" + input;
      return new Promise((resolve, reject) => resolve(input));
    });
  }

  parseCSVRecords(records: any[]): any[] {
    records = super.parseCSVRecords(records);
    records.forEach(function(record, idx) {
      if (record.txn_amount) {
        record.txn_amount = record.txn_amount.replace(/,/g, '');

        if (record.txn_amount >= 0) {
          record.txn_amount_credit = +record.txn_amount;
          record.txn_amount_debit = 0;
        } else {
          record.txn_amount_debit = -1 * record.txn_amount;
          record.txn_amount_credit = 0;
        }

        delete record.txn_amount;

        const type_from_desc_match = record.txn_desc.match(/\s+(\S\S\S?)$/);

        if (type_from_desc_match && type_from_desc_match.length >= 2) {
          record.txn_type = HSBCTransTypes[type_from_desc_match[1]];
        }

        record.txn_src = 'HSBC';
      } else {
        records.splice(idx, 1);
      }
    }.bind(this));

    return records;
  }
}
