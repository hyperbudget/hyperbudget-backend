import { CSVParser } from '../csvparser';

export default class FairFXCorpCSVParser extends CSVParser {
  protected srcName = 'FairFX Corp';
  protected txnMap =  {
    'date'          : 'txn_date',
    'type'          : 'txn_type',
    'pan'           : 'acc_number',
    'description'   : 'txn_desc',
    'debit'         : 'txn_amount_debit',
    'credit'        : 'txn_amount_credit',
  };

  parseCSVRecords(records: any[]): any[]{
    return super.parseCSVRecords(records);
  }
}
