/* eslint-disable prettier/prettier */
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const IV_LENGTH = 16;
const ENCRYPTION_KEY = 'iOnHFuwSVjpt9amoUAyqHGoiyKmT16wh' 
export class TokenService {
    async generateToken(payload: any, password: string | null): Promise<string> {
        //PASSWORD
        password = password ?? ENCRYPTION_KEY;
        //TEXTO PARA ENCRIPTAR
        const stringPayload = JSON.stringify(payload)
        
        const iv = randomBytes(IV_LENGTH);
        const key =  Buffer.from(password);
        const cipher = createCipheriv('aes-256-ctr', key, iv);
        let encryptedData = cipher.update(stringPayload);
        encryptedData = Buffer.concat([encryptedData, cipher.final()]);
        return iv.toString('hex') + ':' + encryptedData.toString('hex');
    }

    async verifyToken(token: string, password: string | null): Promise<string> {
        password = password ?? ENCRYPTION_KEY;
        console.log('password => ',password);
        const textParts = token.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const key = Buffer.from(password);
        console.log('key => ',key)
        const decipher = createDecipheriv('aes-256-ctr', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}