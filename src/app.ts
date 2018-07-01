import * as express from 'express';
import * as bodyParser from 'body-parser';

import * as mongoose from 'mongoose';

import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

import * as sslRedirect from 'heroku-ssl-redirect';
import * as cors from 'cors';
import * as morgan from 'morgan';

import { SystemConfig } from './lib/config/system';
import { authMiddleware } from './lib/middleware/authmiddleware';

import * as categoryRoutes from './routes/encrypted/categories';
import * as transactionRoutes from './routes/encrypted/transactions';
import * as accountRoutes from './routes/account';

class App {
  public express;

  constructor() {
    dotenv.config();

    this.express = express();

    this.setSSL();

    this.express.use(bodyParser.json())
    this.express.use(bodyParser.urlencoded({ extended: true }))

    this.express.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

    this.connectDB();
    this.setUpCORS();

    this.mountHomeRoute();
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

  private setUpCORS(): void {
    this.express.use(cors());
    this.express.options('*', cors());
  }

  private mountHomeRoute(): void {
    const router = express.Router();
    router.get('/', (req, res) => {
      res.json({ ok: true });
    });
    this.express.use('/', router);
  }

  private mountRoutes(): void {
    this.express.post('/account/register', accountRoutes.validateRegistration, accountRoutes.register);
    this.express.post('/account/login', accountRoutes.validateLogin, accountRoutes.login);

    this.express.use('/', authMiddleware);

    this.express.get('/account', accountRoutes.accountInfo);
    this.express.post('/account/categories/update', categoryRoutes.validateUpdateCategories, categoryRoutes.updateCategories);
    this.express.post('/account/categories/list', categoryRoutes.validateGetCategories, categoryRoutes.getCategories);
    this.express.post('/account/transactions/update', transactionRoutes.validateUpdateTransactions, transactionRoutes.updateTransactions);
    this.express.post('/account/transactions/list', transactionRoutes.validateGetTransactions, transactionRoutes.getTransactions);
  }
}

export default new App().express;
