import * as Loki from 'lokijs';
import * as path from 'path';
import * as del from 'del';

export class Utils {
  static format_number(num) {
    return (!isNaN(num) ? Number(num).toFixed(2) : num);
  }

  static loadCollection (colName, db: Loki): Promise<Collection<any>> {
    return new Promise(resolve => {
        db.loadDatabase({}, () => {
          const _collection = db.getCollection(colName) || db.addCollection(colName);
          resolve(_collection);
        });
    });
  }

  static delete_csv_upload(filename: string): void {
    const file = path.join(__dirname, '/../../csvs/', filename);

    del.sync([file]);
  }

  static getDB(): Loki {
    const db = new Loki(path.join(__dirname, '/../../db/db.db'), { persistenceMethod: 'fs' });
    return db;
  }
}
