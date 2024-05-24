import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface CustomRequest extends Request {
    decoded?: JwtPayload;
}

function verificarToken(req: CustomRequest, res: Response, next: NextFunction): Response | void {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 401, message: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.MASTER_KEY as string, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ status: 401, message: 'Token de autenticação expirado' });
            } else {
                return res.status(401).json({ status: 401, message: 'Token de autenticação inválido' });
            }
        }

        const tokenExpiracao = (decoded as JwtPayload).exp! * 1000;
        const agora = Date.now();

        if (agora > tokenExpiracao) {
            return res.status(401).json({ status: 401, message: 'Token de autenticação expirado' });
        }

        req.decoded = decoded as JwtPayload;
        next();
    });
}

export default verificarToken;
