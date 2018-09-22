import * as openpgp from 'openpgp';

export const encrypt = (data: string, passwords: string[]): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    let options: openpgp.EncryptOptions  = {
        message: openpgp.message.fromText(data),
        passwords: passwords,
        armor: true,
        compression: openpgp.enums.compression.zlib
    };

    return openpgp.encrypt(options).then(
      (ciphertext) => {
        resolve(ciphertext.data);
      },
      (e) => reject(e)
    );
  });
}

export const decrypt = (encrypted: string, passwords: string[]): Promise<string> => {
  let decopt: openpgp.DecryptOptions = {
    message: openpgp.message.readArmored(encrypted),
    passwords: passwords,
    format: 'binary'
  };

  return new Promise<string>((resolve, reject) => {
    return openpgp.decrypt(decopt).then(
      (plaintext: openpgp.VerifiedMessage) => {
        resolve(plaintext.data.toString());
      },
      (e) => reject(e)
    );
  });
}
