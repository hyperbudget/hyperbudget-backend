import { Transaction } from '../transaction';
import { Categoriser } from '../categoriser';
import { Category } from '../../types/category';
import { Utils } from '../utils';

import * as moment from 'moment';

export class ReportManager {
  static generate_web_frontend_report (txns: Transaction[]): any[] {
    let formatted = JSON.parse(JSON.stringify(txns));
    let running_total_spend: number = 0;

    formatted.forEach(function(formatted_txn) {
      formatted_txn.cat_class      = formatted_txn.categories.filter((c) => !c.hidden_on_txn_list).map((c) => c.className).join(" ");
      formatted_txn.category_names = formatted_txn.categories.filter((c) => !c.hidden_on_txn_list).map((c) => c.name).join(", ");

      formatted_txn.txn_amount_credit = Utils.format_number(formatted_txn.txn_amount_credit);
      formatted_txn.txn_amount_debit  = Utils.format_number(formatted_txn.txn_amount_debit);
      formatted_txn.acc_balance       = Utils.format_number(formatted_txn.acc_balance);

      formatted_txn.txn_date          = moment(formatted_txn.txn_date).format('YYYY-MM-DD');

      let skip_running = formatted_txn.categories.find((c) => c.hidden_on_running_total);

      if (formatted_txn.txn_amount_debit && !skip_running) {
        running_total_spend += Math.abs(formatted_txn.txn_amount_debit);
      }

      formatted_txn.running_total_spend = Utils.format_number(running_total_spend);
    });

    return formatted;
  }

  static generate_category_amounts (txns: Transaction[], org_txns: Transaction[]) {
    let cat_amts = {};
    let cats: Category[] = Categoriser.categories();

    cats.forEach(function(c) {
      if (!c.hidden_on_cat_list) {
        cat_amts[c.name] = { name: c.name, total: 0, className: c.className, count: 0 };
      }
    });

    txns.forEach(function(txn) {
      txn.categories.forEach(function(cat) {
        // It's the category being listed isn't internal_transfer but the txn cat is, skipit.
        if (! (cat.id !== 'tfr-pers' && Categoriser.is_internal_transfer(txn)) ) {
          if (!cat.hidden_on_cat_list) {
            cat_amts[cat.name].total += txn.txn_amount_credit - txn.txn_amount_debit;
            cat_amts[cat.name].count++;
          }
        }
      });
    });

    let lloyds_match = org_txns.filter( (txn) => txn.txn_src === 'Lloyds' );

    cat_amts['lloyds_match_in'] = {
      name: 'Lloyds Reconciliation - in',
      id: 'lloyds-match-in',
      className: 'lloyds-match',
      total: lloyds_match.reduce((prev: number, next: Transaction) => { return prev + next.txn_amount_credit; }, 0),
      count: lloyds_match.filter((txn) => txn.txn_amount_credit > 0).length
    };

    cat_amts['lloyds_match_out'] = {
      name: 'Lloyds Reconciliation - out',
      id: 'lloyds-match-out',
      className: 'lloyds-match',
      total: lloyds_match.reduce((prev: number, next: Transaction) => { return prev - next.txn_amount_debit; }, 0),
      count: lloyds_match.filter((txn) => txn.txn_amount_debit > 0).length
    };

    //XXX UGLY
    if (cat_amts['Income'] && cat_amts['Expenditure']) {
      cat_amts['total_gains'] = { name: 'In-Out', className: 'gains', total: Math.abs(cat_amts['Income'].total) - Math.abs(cat_amts['Expenditure'].total), count: 'N/A' };
    }

    return cat_amts;
  }

  static generate_category_amounts_frontend (txns: Transaction[], org_txns: Transaction[]) {
    let cat_amts = ReportManager.generate_category_amounts(txns, org_txns);
    let filtered = Object.keys(cat_amts).map((k) => {
      let filtered = cat_amts[k];
      filtered.total = Utils.format_number(filtered.total);
      return filtered;
    });

    return filtered.filter((c) => c.total && c.total != '0.00');
  }

  static generate_monthly_breakdown (txns: Transaction[], months: string[]) {
    let breakdown = {};

    months.forEach(function(month: string) {
      breakdown[month] = { in: 0, main_in: 0, out: 0, gains: 0, main_gains: 0, running: 0, running_main: 0};
    });

    let running: number = 0;
    let running_main: number = 0;

    txns.forEach(function(txn) {
      if (!breakdown[txn.month]) {
        console.log("no breakdown for month ", txn.month);
      }

      txn.categories.forEach(function(cat) {
        if (cat.id === "income") {
          breakdown[txn.month].in += txn.txn_amount_credit;
        } else if (cat.id === "main-income") {
          breakdown[txn.month].main_in += txn.txn_amount_credit;
        } else if (cat.id === 'exp') {
          breakdown[txn.month].out += Math.abs(txn.txn_amount_debit);
        }
      });
    });

    months.forEach(function(month) {
      breakdown[month].gains = breakdown[month].in - breakdown[month].out;
      breakdown[month].main_gains = breakdown[month].main_in - breakdown[month].out;

      running += breakdown[month].gains;
      running_main += breakdown[month].main_gains;

      breakdown[month].running = running;
      breakdown[month].running_main = running_main;
    });


    return breakdown;
  }

  static generate_monthly_breakdown_frontend (txns: Transaction[], months: string[]) {
    let breakdown = ReportManager.generate_monthly_breakdown(txns, months);

    return Object.keys(breakdown).map((k) => {
      return {
        month: k,
        in: breakdown[k].in.toFixed(2),
        out: breakdown[k].out.toFixed(2),
        gains: breakdown[k].gains.toFixed(2),
        main_in: breakdown[k].main_in.toFixed(2),
        main_gains: breakdown[k].main_gains.toFixed(2),
        running: breakdown[k].running.toFixed(2),
        running_main: breakdown[k].running_main.toFixed(2),
      };
    });
  }
}
