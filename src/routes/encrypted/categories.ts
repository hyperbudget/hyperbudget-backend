import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator/check';

import { Utils } from '../../lib/utils';
import { IUserModel } from '../../lib/schema/user';

import * as crypto from '../../lib/crypto';

export const validateUpdateCategories = [
  check('categories').isJSON(),
  check('password').isLength({ min: 8 }),
];

export const updateCategories = (req: Request, res: Response) => {
  Utils.UserFromJWT(req.get('x-jwt')).then((user: IUserModel) => {
    let stringified = JSON.stringify(req.body.categories);
    let password = req.body.password;

    crypto.encrypt(stringified, [password]).then(
      (encrypted: string) => {
        user.set({
          preferences: { categories_encrypted: encrypted },
        });
        user.save().then(
          () => res.json({ ok: true }),
          (err) => {
            console.error(err);
            res.status(500).json({ ok: false, error: 'Error saving information'});
          }
        )
      },
      () => {
        console.error(`Error encrypting information for user ${user._id}`);
        res.status(500).json({ ok: false, error: 'Error encrypting data' });
      }
    );
  });
};

export const getCategories = (req: Request, res: Response) => {

}
