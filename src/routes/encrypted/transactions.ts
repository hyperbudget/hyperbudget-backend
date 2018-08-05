import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator/check';

import { Utils } from '../../lib/utils';
import { IUserModel } from '../../lib/schema/user';

import * as crypto from '../../lib/crypto';

import { validate_transactions } from '@hyperbudget/hyperbudget-core';

export const validateUpdateTransactions = [
  check('transactions').exists(),
  check('password').isLength({ min: 8 }),
];

export const validateGetTransactions = [
  check('password').isLength({ min: 8 }),
];

export const updateTransactions = (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }

  let txn_errors: { id: string, idx: number, errors: string[] }[] =
    (() => {
      const vals = validate_transactions(req.body.transactions);
      return vals.map(val => {
        const errors = val.errors.map(e => e.toString());
        return {
          ...val,
          errors
        };
      });
    })();

  if (txn_errors.length > 0) {
    return res.status(422).json({
      error: [{
        "location": "body",
        "param": "transactions",
        "msg": txn_errors
      }]
    })
  }

  Utils.UserFromJWT(req.get('x-jwt')).then(
    (user: IUserModel) => {
      console.log(`Starting transactions storage, total transactions = ${req.body.transactions.length}`);

      let stringified = JSON.stringify(req.body.transactions);

      console.log(`Stringified length = ${stringified.length} bytes`);

      let password = req.body.password;

      let start = new Date().getTime();

      crypto.encrypt(stringified, [password]).then(
        (encrypted: string) => {
          let end = new Date().getTime();
          console.log(`Finished encryption in ${end-start}ms, encrypted length = ${encrypted.length} bytes`);

          start = new Date().getTime();

          console.log(`Storing in db`);

          user.set({
            data: { transactions_encrypted: encrypted },
          });
          user.save().then(
            () => {
              end = new Date().getTime();
              console.log(`Finished storage in ${end-start}ms`);
              return res.json({ ok: true });
            },
            (err) => {
              console.error(err);
              res.status(422).json({
                ok: false,
                error: { type: 'database', message: 'Error saving information' }
              });
            }
          )
        },
        () => {
          console.error(`Error encrypting information for user ${user._id}`);
          res.status(422).json({
            ok: false,
            error: { type: 'encryption', message: 'Error encrypting data' }
          });
        }
      );
    },
    (err) => { res.status(422).json({ type: 'login', message: err }) }
  )
};

export const getTransactions = (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }

  Utils.UserFromJWT(req.get('x-jwt')).then((user: IUserModel) => {
    let transactions_encrypted: string = user.data.transactions_encrypted;

    if (!transactions_encrypted) {
      return res.status(200).json({ transactions: [] });
    }

    crypto.decrypt(transactions_encrypted, req.body.password).then(
      (decrypted: string) => {
        return res.status(200).json({
          transactions: JSON.parse(decrypted)
        });
      },
      () => {
        return res.status(500).json({
          ok: false,
          error: [{
            type: 'decryption',
            msg: 'Could not decrypt transactions, did you give your transaction password correctly?',
          }]
        })
      }
    )
  });
}
