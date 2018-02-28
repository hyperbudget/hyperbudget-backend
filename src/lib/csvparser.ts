import * as fs from 'fs';
import * as parse from 'csv-parse';

export class CSVParser {
  protected txnMap = {};
  protected srcName: string = 'Generic Parser';

  parseCSVRecords(records: any): any[] {
    records.forEach(function(record) {
      Object.keys(record).forEach(function(key: string) {
        if (this.txnMap[key]) {
          let name: string = this.txnMap[key];
          record[name] = record[key];
        }
        delete record[key];
      }.bind(this));
      record.txn_src = this.srcName;
    }.bind(this));

    return records;
  }

  parseCSVFile(csv_filename: string): Promise<any> {
    return new Promise(
      function(resolve, reject) {
        this.readFile(csv_filename).then(function(csv_text: string) {
          parse(
            csv_text, { columns: true },
            function(err, records) {
              if (err) {
                console.log(`error at ${csv_filename}`);
                throw new Error(err);
              }

              resolve(this.parseCSVRecords(records));
            }.bind(this)
          );
        }.bind(this));
      }.bind(this)
    );
  }

  protected readFile(csv_filename: string): Promise<any> {
    let input: string = fs.readFileSync(csv_filename).toString();

    input = input.replace(/,\n/,"\n");
    input = input.replace(/,\r\n/,"\r\n");
    input = input.replace(/'/g,'');

    return new Promise((resolve, reject) => resolve(input));
  }
}
