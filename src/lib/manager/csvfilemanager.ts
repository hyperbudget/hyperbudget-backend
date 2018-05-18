import { ReportFactory, CSVParserManager } from "hyperbudget-core";
import * as fs from 'fs';

export class CSVFileManager {
  static add_csvs(rf: ReportFactory, csvs: { name: string, type: string }[], idx: number = 0, records: any[] = []): Promise<any> {
    if (!csvs.length) {
      return Promise.resolve();
    }

    return new Promise(
      (resolve, reject) => (fs.readFile(csvs[idx].name, (err: NodeJS.ErrnoException, result: Buffer) => err ? reject(err) : resolve(result.toString())))
    )
      .then((csv_text: string) => CSVParserManager.parseCSVFile(csv_text, csvs[idx].type))
      .then(function (new_records: any[]) {
        records = records.concat(new_records);
        if (idx !== csvs.length - 1) {
          return CSVFileManager.add_csvs(rf, csvs, idx + 1, records);
        } else {
          return rf.add_records(records);
        }
      });
  }
}