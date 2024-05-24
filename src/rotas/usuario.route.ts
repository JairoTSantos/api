import { Router, Request, Response } from 'express';
import { UniqueConstraintError, WhereOptions, ForeignKeyConstraintError } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

import Usuario from '../modelos/usuario.modelo';
import UsuarioNivel from '../modelos/usuarioNivel.modelo';

const router = Router();

router.get('/usuarios', async (req: Request, res: Response) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['usuario_senha', 'usuario_nivel'] },
            include: [{
                model: UsuarioNivel,
                as: 'nivel',
                attributes: ['usuario_nivel_nome']
            }]
        });

        if (usuarios.length === 0) {
            return res.status(200).json({ status: 200, mensagem: "Nenhum usuário registrado" });
        }

        return res.status(200).json({ status: 200, mensagem: "Usuários encontrados", dados: usuarios });
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

router.get('/usuarios/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const usuarios = await Usuario.findByPk(id, {
            attributes: { exclude: ['usuario_senha', 'usuario_nivel'] },
            include: [{
                model: UsuarioNivel,
                as: 'nivel',
                attributes: ['usuario_nivel_nome']
            }]
        });

        if (!usuarios) {
            return res.status(200).json({ status: 200, mensagem: "Usuário não encontrado" });
        }

        return res.status(200).json({ status: 200, mensagem: "Usuário encontrado", dados: usuarios });
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

router.delete('/usuarios/:id', async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        const condition: WhereOptions = { usuario_id: id };

        const resp = await Usuario.destroy({ where: condition });

        if (resp) {
            return res.status(200).json({ status: 200, mensagem: "Usuário apagado com sucesso." });
        } else {
            return res.status(404).json({ status: 404, mensagem: "Usuário não encontrado." });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

router.post('/usuarios', async (req: Request, res: Response) => {
    const dados = req.body;

    const camposObrigatorios = ['usuario_nome', 'usuario_email', 'usuario_aniversario', 'usuario_senha', 'usuario_telefone', 'usuario_nivel', 'usuario_ativo'];
    const camposFaltando = camposObrigatorios.filter(campo => !(campo in dados));
    const camposVazios = camposObrigatorios.filter(campo => dados[campo] === '');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (camposFaltando.length > 0 || camposVazios.length > 0 || !Number.isInteger(dados.usuario_nivel) || !emailRegex.test(dados.usuario_email)) {
        return res.status(400).json({ status: 400, mensagem: "Campos obrigatórios faltando ou vazios, ou formato de dados incorretos" });
    }

    const senhaCriptografada: string = await bcrypt.hash(dados.usuario_senha, 10);
    dados.usuario_senha = senhaCriptografada;

    try {
        await Usuario.create(dados);
        return res.status(200).json({ status: 200, mensagem: "Usuário inserido com sucesso!" });
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({ status: 409, mensagem: "O email já está em uso." });
        } else if (error instanceof ForeignKeyConstraintError) {
            return res.status(400).json({ status: 400, mensagem: "Nível de usuário não existe." });
        } else {
            return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log", error });
        }
    }

});

router.put('/usuarios/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const dados = req.body;
    const camposValidos = ['usuario_nome', 'usuario_email', 'usuario_aniversario', 'usuario_senha', 'usuario_telefone', 'usuario_nivel'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    try {
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ status: 404, mensagem: "Usuário não encontrado." });
        }

        const camposEnviados = Object.keys(dados);
        const camposInvalidos = camposEnviados.filter(campo => !camposValidos.includes(campo));

        if (camposEnviados.length === 0) {
            return res.status(400).json({ status: 400, mensagem: "Nenhum campo foi enviado." });
        }

        if (camposInvalidos.length > 0) {
            return res.status(400).json({ status: 400, mensagem: "Campos inválidos enviados." });
        }

        if (dados.usuario_email !== undefined) {
            if (dados.usuario_email.trim() === "") {
                return res.status(400).json({ status: 400, mensagem: "Email não pode estar vazio" });
            }

            if (!emailRegex.test(dados.usuario_email)) {
                return res.status(400).json({ status: 400, mensagem: "Formato de email incorreto" });
            }
        }

        await usuario.update(dados);
        return res.status(200).json({ status: 200, mensagem: "Usuário atualizado com sucesso!" });
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log", error });
    }
});

router.get('/niveis-usuarios', async (req: Request, res: Response) => {
    try {
        const niveis = await UsuarioNivel.findAll();

        if (niveis.length === 0) {
            return res.status(200).json({ status: 200, mensagem: "Nenhum nível de usuário registrado" });
        }

        return res.status(200).json({ status: 200, mensagem: "Níveis encontrados", dados: niveis });
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

router.get('/usuarios-sync', async (req: Request, res: Response) => {
    try {
        const tableName = Usuario.getTableName();
        const tableExists = await sequelize.getQueryInterface().describeTable(tableName)
            .then(() => true)
            .catch(() => false);

        if (tableExists) {
            return res.status(200).json({ status: 200, mensagem: "Tabela já existe" });
        } else {
            await Usuario.sync({ alter: true });
            return res.status(200).json({ status: 200, mensagem: "Tabela sincronizada" });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

router.get('/niveis-sync', async (req: Request, res: Response) => {
    try {
        const tableName = UsuarioNivel.getTableName();
        const tableExists = await sequelize.getQueryInterface().describeTable(tableName)
            .then(() => true)
            .catch(() => false);

        if (tableExists) {
            return res.status(200).json({ status: 200, mensagem: "Tabela já existe" });
        } else {
            await UsuarioNivel.sync({ alter: true });
            await UsuarioNivel.bulkCreate(
                [
                    {
                        usuario_nivel_id: 1,
                        usuario_nivel_nome: 'Administrador'
                    },
                    {
                        usuario_nivel_id: 2,
                        usuario_nivel_nome: 'Assessor'
                    }
                ],
                { updateOnDuplicate: ['usuario_nivel_nome'] }
            );
            return res.status(200).json({ status: 200, mensagem: "Tabela sincronizada" });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

export default router;