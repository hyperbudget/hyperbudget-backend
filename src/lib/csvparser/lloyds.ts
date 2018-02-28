import { CSVParser } from '../csvparser';

export default class LloydsCSVParser extends CSVParser {
  protected srcName = 'Lloyds';

  protected txnMap =  {
    'Transaction Date'       : 'txn_date',
    'Transaction Type'       : 'txn_type',
    'Sort Code'              : 'acc_sortcode',
    'Account Number'         : 'acc_number',
    'Transaction Description': 'txn_desc',
    'Debit Amount'           : 'txn_amount_debit',
    'Credit Amount'          : 'txn_amount_credit',
    'Balance'                : 'acc_balance'
  };

  parseCSVRecords(records: any[]): any[] {
    return super.parseCSVRecords(records);
  }
}
