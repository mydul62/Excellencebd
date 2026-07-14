import jwt, { JwtPayload ,SignOptions } from 'jsonwebtoken';


const generateToken = (payload:any,secret:string,expiresIn:number) => {
    
    const options: SignOptions = {
      algorithm: 'HS256',
      expiresIn,
    };

    const token = jwt.sign(
        payload,
        secret,
        options
    )
    return token
}

const verifyToken = (token:string,secret:string) => {
    return jwt.verify(token,secret) as JwtPayload;
}

export const Jwthelper = {
    generateToken,
    verifyToken
}