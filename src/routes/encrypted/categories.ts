import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator/check';

import { Utils } from '../../lib/utils';
import { IUserModel } from '../../lib/schema/user';

import * as crypto from '../../lib/crypto';

import { validate_categories, Category } from '@hyperbudget/hyperbudget-core';

const defaultCategories: Category[] = require('../../../default_categories.json');

export const validateUpdateCategories = [
  check('categories').exists(),
  check('password').isLength({ min: 8 }),
];

export const validateGetCategories = [
  check('password').isLength({ min: 8 }),
];

export const updateCategories = (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }
  /*
  [{
    "location": "body",
    "param": "password",
    "msg: "Invalid value"
  }] */

  let cat_errors: { id: string, idx: number, errors: string[] }[] =
    (() => {
      const vals = validate_categories(req.body.categories);
      return vals.map(val => {
        const errors = val.errors.map(e => e.toString());
        return {
          ...val,
          errors
        };
      });
    })();

  if (cat_errors.length > 0) {
    return res.status(422).json({
      error: [{
        "location": "body",
        "param": "categories",
        "msg": cat_errors
      }]
    })
  }

  Utils.UserFromJWT(req.get('x-jwt')).then(
    (user: IUserModel) => {
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

export const getCategories = (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }

  Utils.UserFromJWT(req.get('x-jwt')).then((user: IUserModel) => {
    let categories_encrypted: string = user.preferences.categories_encrypted;

    if (!categories_encrypted) {
      defaultCategories.forEach((category: Category) => {
        Object.keys(category.category_rules).forEach((k) => {
          if (category.category_rules[k].rules) {
            let rules = category.category_rules[k].rules;
            rules.forEach(r => {
              if (Array.isArray(r) && r[1] && r[1] === "$NAME") {
                r[1] = user.lastName;
              }
            });
          }
        });
      });

      return res.status(200).json({
        categories: defaultCategories,
      });
    }

    crypto.decrypt(categories_encrypted, req.body.password).then(
      (decrypted: string) => {
        return res.status(200).json({
          categories: JSON.parse(decrypted)
        });
      },
      () => {
        return res.status(500).json({
          ok: false,
          error: [{
            type: 'decryption',
            msg: 'Could not decrypt preferences, did you give your transaction password correctly?',
          }]
        })
      }
    )
  });
}
