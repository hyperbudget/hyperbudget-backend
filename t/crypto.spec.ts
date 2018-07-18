import { encrypt, decrypt } from '../src/lib/crypto';

import { expect, assert } from 'chai';
import 'mocha';

describe('Crypto', () => {
  it('Encrypts & Decrypts', () => {
    return encrypt('test', ['passpass']).then((encrypted) => {
      expect(encrypted).to.match(/^-----BEGIN PGP MESSAGE-----/);
      expect(encrypted).to.be.a('string');
      return encrypted;
    }).then((encrypted) => {
      return decrypt((encrypted), ['passpass']).then((decrypted) => {
        expect(decrypted).to.equal('test');
      });
    });
  });
  it('Errors if it cannot decrypt', () => {
    return encrypt('test', ['passpass']).then((encrypted) => {
      expect(encrypted).to.match(/^-----BEGIN PGP MESSAGE-----/);
      expect(encrypted).to.be.a('string');
      return encrypted;
    }).then((encrypted) => {
      return decrypt((encrypted), ['wrong password']).then(
        () => {
        },
        (err) => {
          expect(err).to.be.a('Error');
        }
      );
    });
  });
});
