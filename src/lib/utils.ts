import * as jwt from 'jsonwebtoken';
import { SystemConfig } from './config/system';
import { User, UserModel } from './schema/user';

export class Utils {
  static JWTSign(data: any): string {
    return jwt.sign(
      data,
      SystemConfig.config.app.token_secret,
      {
        expiresIn: SystemConfig.config.app.token_expiry,
        algorithm: 'HS256',
      }
    );
  }

  static UserFromJWT(jwt_encoded: string): PromiseLike<User> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        jwt_encoded,
        SystemConfig.config.app.token_secret,
        {
          algorithms: ['HS256'],
        },
        (err, decoded) => {
          if (err) {
            reject(err);
          }

          UserModel.findById(decoded['user']['id']).then((user: User) => {
            if (!user) {
             reject("no such user");
            }

            resolve(user);
          });
        }
      );
    })
  }
}
