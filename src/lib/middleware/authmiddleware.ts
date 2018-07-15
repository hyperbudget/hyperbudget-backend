import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { SystemConfig } from '../config/system';

export const authMiddleware = (req: Request, res: Response, next) => {
  jwt.verify(
    req.get('x-jwt'),
    SystemConfig.config.app.token_secret,
    (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          error: [{
            msg: 'not authenticated',
            type: 'auth',
          }]
        });
      }

      next();
    }
  );
}
