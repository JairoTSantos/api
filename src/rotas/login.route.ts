import { Router, Request, Response } from 'express';
import { UniqueConstraintError, WhereOptions, ForeignKeyConstraintError } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

import Usuario from '../modelos/usuario.modelo';

const router = Router();


router.post('/login', async (req: Request, res: Response) => {
    const email = req.body.email;
    const senha = req.body.senha;

    if (!req.body.email || !req.body.senha) {
        return res.status(404).json({ status: 404, message: 'Preencha os campos obrigatórios' });
    }


    if (email === process.env.MASTER_EMAIL && senha === process.env.MASTER_PASS) {

        const payload = {
            usuario_nome: process.env.MASTER_USER,
            usuario_nivel: 1,
            usuario_email: process.env.MASTER_EMAIL,
            usuario_id: 1,
        };

        const token = jwt.sign(payload, process.env.MASTER_KEY!, { expiresIn: process.env.TOKEN_TIME });

        return res.status(200).json({ status: 200, message: 'Login feito com sucesso', token: token });
    }


    try {
        const usuario = await Usuario.findOne({
            where: { usuario_email: email }
        });

        if (!usuario) {
            return res.status(404).json({ status: 404, message: 'Email incorreto' });
        }

        const senhaCorrespondente = await bcrypt.compare(senha, usuario.usuario_senha);

        if (!senhaCorrespondente) {
            return res.status(401).json({ status: 401, message: 'Senha incorreta' });
        }

        if (!usuario.usuario_ativo) {
            return res.status(403).json({ status: 403, message: 'Usuário desativado' });
        }

        const payload = {
            usuario_nome: usuario.usuario_nome,
            usuario_nivel: usuario.usuario_nivel,
            usuario_email: usuario.usuario_email,
            usuario_id: usuario.usuario_id
        };
        
        const token = jwt.sign(payload, process.env.MASTER_KEY!, { expiresIn: process.env.TOKEN_TIME });
        

        return res.status(200).json({ status: 200, message: 'Login feito com sucesso', token: token });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Erro interno do servidor', error: error });
    }

});


export default router;