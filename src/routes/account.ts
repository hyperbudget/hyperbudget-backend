import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator/check';

export const validateRegistration = [
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
];

export const register = (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }

  let { email, password } = req.body;
  console.log(email);

  res.json({
    success: 1,
    userId: 1,
  });
};
