import * as path from 'path';
import { Utils } from '../utils';

export class UploadManager {

  static async handleReportCSVUpload(file: Express.Multer.File, report_type: string) {
    let file_details = JSON.parse(JSON.stringify(file));

    let db = Utils.getDB();
    const col = await Utils.loadCollection('files', db);

    const existing_file = col.findOne({ originalname: file_details.originalname });

    if (existing_file) {
      Utils.delete_csv_upload(existing_file.filename);
      col.remove(existing_file);
    }

    file_details.report_type = report_type;

    const data = col.insert(file_details);
    await db.saveDatabase();
  }
}
