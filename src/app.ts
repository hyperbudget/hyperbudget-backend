import * as express from 'express';
import * as multer from 'multer';
import * as bodyParser from 'body-parser';
import * as hbs from 'hbs';

import * as mongoose from 'mongoose';

import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

import * as sslRedirect from 'heroku-ssl-redirect';
import * as cors from 'cors';

import { SystemConfig } from './lib/config/system';
import { authMiddleware } from './lib/middleware/authmiddleware';

import * as reportRoutes from './routes/report';
import * as accountRoutes from './routes/account';
import * as categoryRoutes from './routes/encrypted/categories';

class App {
  public express;
  private upload_middleware;

  constructor() {
    dotenv.config();

    this.express = express();

    this.setSSL();

    this.express.use(bodyParser.json())
    this.express.use(bodyParser.urlencoded({ extended: true }))

    this.connectDB();

    this.setUploadMiddleware();
    this.setUpCORS();

    this.mountHomeRoute();
    this.setStatic();
    this.setViewEngine();

    this.mountRoutes();

    this.initConfig();
  }

  private setSSL() {
    this.express.use(sslRedirect([
      'staging',
      'production'
      ]));
  }

  private connectDB(): void {
    mongoose.connect(process.env.MONGODB_URI);
  }

  private initConfig(): void {
    const config_path = path.join(__dirname, '/../config.json');

    if ( !fs.existsSync(config_path) ) {
      console.error("config.json does not exist, did you set up? (see config.json.example)");
      process.exit(1);
    }

    let config = fs.readFileSync( config_path, 'utf8' );

    console.log("Config initialised...");

    SystemConfig.config = config ? JSON.parse(config) : {};

    if (process.env.TOKEN_SECRET) {
      SystemConfig.config.app.token_secret = process.env.TOKEN_SECRET;
    }

    if (process.env.TOKEN_EXPIRY) {
      SystemConfig.config.app.token_expiry = +process.env.TOKEN_EXPIRY;
    }

    if (
      !SystemConfig.config.app.token_secret
      || SystemConfig.config.app.token_secret === 'CHANGEME'
    ) {
      throw new Error("Remember to copy config.json and set a webtoken secret");
    }
  }

  private setUploadMiddleware(): void {
    const upload = multer({ dest: path.join(__dirname, '/../csvs/') }); // multer configuration
    this.upload_middleware = upload;
  }

  private setStatic(): void {
    this.express.use(express.static(path.join(__dirname, '/../src/public')));
    this.express.use(express.static(path.join(__dirname, '/../dist/public')));
  }

  private setViewEngine(): void {
    this.express.set('view engine', 'hbs');
    this.express.set('views', path.join(__dirname, '/../src/views'));
    hbs.registerPartials(__dirname + '/../src/views/partials');
  }

  private setUpCORS(): void {
    this.express.use(cors());
    this.express.options('*', cors());
  }

  private mountRoutes(): void {
    this.express.get('/report/', reportRoutes.index);
    this.express.get('/report/remote', reportRoutes.remote);
    this.express.get('/report/breakdown', reportRoutes.summary);
    this.express.post('/report/breakdown', reportRoutes.summary);
    this.express.post('/report/upload', this.upload_middleware.single('csv'), reportRoutes.upload);
    this.express.get('/report/:month', reportRoutes.report);

    this.express.post('/account/register', accountRoutes.validateRegistration, accountRoutes.register);
    this.express.post('/account/login', accountRoutes.validateLogin, accountRoutes.login);

    this.express.use('/', authMiddleware);

    this.express.get('/account', accountRoutes.accountInfo);
    this.express.post('/account/update-categories', categoryRoutes.updateCategories);
  }

  private mountHomeRoute(): void {
    const router = express.Router();
    router.get('/', (req, res) => {
      res.redirect('/report/');
    });
    this.express.use('/', router);
  }
}

export default new App().express;
