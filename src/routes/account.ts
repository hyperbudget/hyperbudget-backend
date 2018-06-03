import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator/check';

import { UserModel, User } from '../lib/schema/user';

export const validateRegistration = [
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
  check('firstname').isAlphanumeric(),
];

export const register = (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }

  let { email, password, firstname } = req.body;
  console.log(email);

  UserModel.create({
    email: email,
    password: password,
    firstName: firstname,
  }).then(() => UserModel.findOne({
    email: email
  })).then((user: User) => {
    console.log("found user", user);
  });

  res.json({
    success: 1,
    userId: 1,
  });
};
