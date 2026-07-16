import jwt, { SignOptions } from 'jsonwebtoken';
export const createToken = (
  jwtPayload: { id: string; name: string; email: string; role: string },
  secret: string,
  expiresIn: string | number
) => {
  const signOptions: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };
  const token = jwt.sign(jwtPayload, secret, signOptions);
  return token;
};
