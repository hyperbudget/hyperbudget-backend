import { Request, Response } from 'express';

import { Report, ReportFactory } from '../lib/report';
import { ReportManager } from '../lib/manager/reportmanager';
import { UploadManager } from '../lib/manager/uploadmanager';
import Options from '../lib/options';
import { Utils } from '../lib/utils';

//import { FairFXRetailRESTRemote } from '../lib/remotes/fairfx-retail-rest';

import * as moment from 'moment';
import * as multer from 'multer';
import { Moment } from 'moment';
import { Transaction } from '../lib/transaction';

import { SystemConfig } from '../lib/config/system';

let _loadFiles = async () => {
  let db: Loki = Utils.getDB();
  const col: Collection<any> = await Utils.loadCollection('files', db);
  const files: any[] = col.find({});

  let csvs = [];

  files.forEach(function(file) {
    csvs.push({ name: file.filename, type: file.report_type });
  });

  return csvs;
}

export let index = function(req: Request, res: Response) {
  let now = moment().format('YYYYMM');
  console.log("from router", SystemConfig.config);
  res.redirect(`/report/${now}`);
};

export let report = async (req: Request, res: Response) => {
  let month: string = req.params.month;

  // Go from 201701 to 20170101
  let calendar_month: string = month + '01';
  let date: Moment = moment(calendar_month);

  if (!date.isValid()) {
    res.render('report', { error: 'Invalid date' });
    return;
  }

  let csvs = await _loadFiles();

  let rf = new ReportFactory({ month: month, date_format: Options.DATE_FORMAT_EUROPE, unique_only: true });
  rf.
    from_csvs(
      csvs
    )
    .then(
      function() {
        let report:Report = rf.report;

        report.transactions = report.transactions.sort(function(a,b) { return a.txn_date.getTime() - b.txn_date.getTime() });
        let txns = ReportManager.generate_web_frontend_report(report.transactions);
        let cats = ReportManager.generate_category_amounts_frontend(report.transactions, report.transactions_org);

        /*res.json({
          'report': report,
          });*/

        let nextDate = date.clone().add(1, 'month').format('YYYYMM');
        let prevDate = date.clone().subtract(1, 'month').format('YYYYMM');

        res.render('report', {
          transactions: txns,
          categories: cats,
          nextDate: nextDate,
          prevDate: prevDate,
          month: month,
          human: moment(month, 'YYYYMM').format('MMM YYYY'),
          currentMonth: moment().format('YYYYMM'),
        });
      }
    );
};

export let remote = async (req: Request, res: Response) => {
  /*
  * TODO
  * This is an example of a report generated from data
  * retrieved from an API.

  const remote = new FairFXRetailRESTRemote();
  const rf = new ReportFactory({ date_format: Options.DATE_FORMAT_SANE, });

  remote.authenticate('', '')
  .then(() => remote.get_transactions(631754))
  .then(response => new Promise((resolve, reject) => resolve(remote.translate_transactions(response))))
  .then(records => {
    return rf.add_records(
      records
    )
  })
  .then(() => {
    let report = rf.report;
    //XXX COPYPASTA
    report.transactions = report.transactions.sort(function(a,b) { return a.txn_date.getTime() - b.txn_date.getTime() });
    let txns = ReportManager.generate_web_frontend_report(report.transactions);
    let cats = ReportManager.generate_category_amounts_frontend(report.transactions, report.transactions_org);

    res.render('report', {
      transactions: txns,
      categories: cats,
      currentMonth: moment().format('YYYYMM'),
    });
  });
  */
};

export let upload = async (req: Request, res: Response) => {
  let month = req.body.month;

  await UploadManager.handleReportCSVUpload(req.file, req.body.type);

  res.redirect('/report/' + month);
};

export let summary = async (req: Request, res: Response) => {
  let start: string;
  let end: string;

  let csvs = await _loadFiles();

  if (req.body) {
    start = req.body.start;
    end = req.body.end;
  }

  if (start && end) {
    // FIXME: this is from input[type="month"]. I don't like this - we should
    // use a library.

    // For chrome at least: it's e.g. 2018-01
    start = start.replace("-","");
    end = end.replace("-","");


    let current_mo: Moment = moment(start, 'YYYYMM');
    let end_mo: Moment = moment(end, 'YYYYMM').add(1, 'month');

    if (end_mo < current_mo) {
      console.error("gave an end month before start");
      res.redirect('/report/breakdown');
      return;
    }

    let rf = new ReportFactory({ date_format: Options.DATE_FORMAT_EUROPE, unique_only: true });
    rf.
      from_csvs(
        csvs
      )
      .then(
        function() {
          let report: Report = rf.report;

          let end_time = new Date().getTime();

          report.transactions = report.transactions.sort(function(a,b) { return a.txn_date.getTime() - b.txn_date.getTime() });

          report.transactions = report.transactions.filter(function(txn: Transaction) {
            return txn.month >= start && txn.month <= end;
          });

          let months: string[] = [];

          var i = 0;

          while (current_mo.toDate().getTime() != end_mo.toDate().getTime()) {
            months.push(current_mo.format('YYYYMM'));
            current_mo.add(1, "month");

            if (i++>100) { break; }
          }

          let breakdown: any[] = ReportManager.generate_monthly_breakdown_frontend(report.transactions, months);

          res.render('summary/view', {
            breakdown: breakdown,
            months: months,
          });
        }
      );
    } else {
      res.render('summary/choice');
    }
}
