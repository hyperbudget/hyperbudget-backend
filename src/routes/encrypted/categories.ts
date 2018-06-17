import { Request, Response } from 'express';
import { Utils } from '../../lib/utils';
import { IUserModel } from '../../lib/schema/user';

export const updateCategories = (req: Request, res: Response) => {
  console.log(req.body.categories);
  Utils.UserFromJWT(req.get('x-jwt')).then((user: IUserModel) => {
    console.log(user);
    user.set({
      preferences: { categories: req.body.categories },
    });
    user.preferences.categories.push(req.body.categories);
    user.markModified('preferences.categories');
    user.save().then(
      () => res.json({ ok: true }),
      (err) => { console.log(err) }
    )
  });
};
