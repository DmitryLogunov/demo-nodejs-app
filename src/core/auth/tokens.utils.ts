import * as crypto from 'crypto';

const generateToken = (): string =>
  crypto
    .createHash('md5')
    .update(Math.random().toString())
    .digest('hex');

export default generateToken;
