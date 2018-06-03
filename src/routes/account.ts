import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator/check';

import { UserModel, User, IUserModel } from '../lib/schema/user';

import * as bcrypt from 'bcryptjs';

export const validateRegistration = [
  check('email').custom((value) => (
    UserModel.findOne({ email: value })
    .then((user: User) => (
      user ? Promise.reject('email in use') : Promise.resolve(true))
    )
  )),
  check('password').isLength({ min: 8 }),
  check('firstname').optional().isAlphanumeric(),
];

export const register = (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }

  let { email, password, firstname } = req.body;
  console.log(email);

  bcrypt.hash(password, 10)
  .then((hashed_password) => UserModel.create({
      email: email,
      password: hashed_password,
      firstName: firstname,
    })
  )
  .then(() => UserModel.findOne({
    email: email
  }))
  .then((user: User) => {
    console.log("found user", user);
    res.json({
      success: 1,
      userId: user.id,
    });
  });
};
