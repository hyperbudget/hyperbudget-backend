import { Categoriser } from './categoriser';
import { Category } from '../types/category';
import Options from './options';

import * as moment from 'moment';
import * as sha1 from 'sha1';

export class Transaction {
  readonly identifier: string;
  readonly txn_date: Date;
  readonly txn_type: string = '';
  readonly acc_sortcode: string = '';
  readonly acc_number: string = '';
  readonly txn_desc: string = '';
  readonly txn_amount_debit: number = 0;
  readonly txn_amount_credit: number = 0;
  readonly txn_src: string = 'Unknown';
  readonly acc_balance: number = 0;
  readonly month: string = '';
  readonly org_month: string = '';
  readonly categories: Category[] = [];

  readonly options: any;

  constructor(record, options={}) {
    this.options = options;

    let _validators = {
      'txn_amount_debit' : function(val) { return (!val || !isNaN(val)); },
      'txn_amount_credit': function(val) { return (!val || !isNaN(val)); },
      'acc_balance'      : function(val) { return !isNaN(val); },
    };

    let _filters = {
      'txn_amount_debit': function(val) { return Number(val); },
      'txn_amount_credit': function(val) { return Number(val); },
      'txn_date': function(val) { return this._parse_date(val); }.bind(this),
    };
    Object.keys(record).forEach(function(key) {
      this[key] = record[key];

      if (_filters[key]) {
        this[key] = _filters[key](this[key]);
      }
      if (_validators[key]) {
        if (!_validators[key](this[key])) {
          throw new Error(`Property '${key}' (${this[key]}) fails validation: ${_validators[key]} ${this} ${record}`);
        }
      }
    }.bind(this));

    this.org_month = moment(this.txn_date).format('YYYYMM');
    this.identifier  = this._build_identifier();
    this.categories = Categoriser.categorise(this);

    this.month = this._find_month();
  }

  /*private _find_month(): string {
    let date = moment(this.txn_date);
    let expected_txns = this.options.expected_txns;

    expected_txns.forEach(function (txn_config) {
      if (Categoriser.transaction_matches_rule(this, txn_config)) {
        let time_constr;
        if (time_constr = txn_config.time_constr) {
          let match = true;

          if (time_constr.date) {

          }
        }
      }
    });

  }
*/

  // Sometimes we want to adjust which month transactions appear on. For
  // example, salary comes in at the end of each month, so it should count as
  // income for the next month

  // Returns a string like '201704'
  private _find_month(): string {
    let date = moment(this.txn_date);

    this.categories.forEach((cat) => {
      if (cat.txn_month_modifier) {
        date.add(cat.txn_month_modifier, 'month');
      }
    });

    return date.format('YYYYMM');
  }

  has_month_changed() {
    return this.month !== moment(this.txn_date).format('YYYYMM');
  }

  txn_amount() {
    return this.txn_amount_credit - this.txn_amount_debit;
  }

  private _parse_date(txn_date: string): Date {
    let options = this.options;
    let format: string;

    format = options.date_format ? options.date_format : Options.DATE_FORMAT_EUROPE;

    return moment(txn_date, format).toDate();
  }

  /*
   * Assuming each { Date, Description, Amount } represents a unique
   * transaction, generate an identifying sha1 hash (Date + Description +
   * Amount + Source + If available, the account balance).  In reality, there
   * is no way to guarantee the uniqueness of a transaction.
   */
  private _build_identifier(): string {
    return sha1(this.txn_date.getTime() + this.txn_desc + this.txn_amount() + this.txn_src + (this.acc_balance ? this.acc_balance : ''));
  }
}
