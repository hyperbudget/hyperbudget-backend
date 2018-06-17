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
      }
    );
  }

  static UserFromJWT(jwt_encoded: string): PromiseLike<User> {
    let decoded = jwt.decode(jwt_encoded);

    return new Promise((resolve, reject) => {
      UserModel.findById(decoded['user']['id']).then((user: User) => {
        if (!user) {
          reject("no such user");
        }

        resolve(user);
      });
    });
  }
}
