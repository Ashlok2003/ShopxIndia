import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
    jwksUri: `${process.env.COGNITO_DOMAIN_URL}/.well-known/jwks.json`
})

const getKey = (header: any, callback: (err: any, key?: string) => void) => {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        }
        else {
            const signingKey = key?.getPublicKey();
            callback(null, signingKey);
        }
    });
}


export const validateToken = async (token: string): Promise<any> => {

    if (!token) {
        throw new Error("Unauthorized");
    }

    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey,
            {
                algorithms: ["RS256"],
                issuer: process.env.COGNITO_ISSUER_DOMAIN!,
            },
            (error, decoded) => {
                if (error) {
                    reject(new Error("Invalid token"));
                } else {
                    resolve(decoded);
                }
            }
        );
    });
};