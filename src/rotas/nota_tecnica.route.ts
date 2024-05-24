import { Router, Request, Response } from 'express';
import { UniqueConstraintError, WhereOptions, ForeignKeyConstraintError } from 'sequelize';
import sequelize from '../config/database';

import NotaTecnica from '../modelos/notaTecnica.modelo';
import Usuario from '../modelos/usuario.modelo';

const router = Router();

router.post('/notas-tecnicas/', async (req: Request, res: Response) => {
    const dados = req.body;

    const camposObrigatorios = ['nota_proposicao', 'nota_titulo', 'nota_apelido', 'nota_texto', 'nota_criada_por'];
    const camposFaltando = camposObrigatorios.filter(campo => !(campo in dados));
    const camposVazios = camposObrigatorios.filter(campo => dados[campo] === '');

    if (camposFaltando.length > 0 || camposVazios.length > 0) {
        return res.status(400).json({ status: 400, mensagem: "Campos obrigatórios faltando ou vazios, ou formato de dados incorretos" });
    }

    try {
        await NotaTecnica.create(dados);
        return res.status(200).json({ status: 200, mensagem: "Nota criada com sucesso!" });
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({ status: 409, mensagem: "Essa proposição ja contém uma nota técnica" });
        } else if (error instanceof ForeignKeyConstraintError) {
            return res.status(400).json({ status: 400, mensagem: "Usuário não existe." });
        } else {
            return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log", error });
        }
    }
});

router.put('/notas-tecnicas/:id', async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);
    const dados = req.body;

    const camposObrigatorios = ['nota_proposicao', 'nota_titulo', 'nota_apelido', 'nota_texto', 'nota_criada_por'];
    const camposVazios = camposObrigatorios.filter(campo => dados[campo] === '');

    if (camposVazios.length > 0) {
        return res.status(400).json({ status: 400, mensagem: "Campos obrigatórios vazios" });
    }

    try {
        const notaExistente = await NotaTecnica.findByPk(id);

        if (!notaExistente) {
            return res.status(404).json({ status: 404, mensagem: "Nota não encontrada" });
        }

        const camposEnviados = Object.keys(dados);
        const camposInvalidos = camposEnviados.filter(campo => !camposObrigatorios.includes(campo));

        if (camposInvalidos.length > 0) {
            return res.status(400).json({ status: 400, mensagem: "Campos inválidos enviados." });
        }

        await notaExistente.update(dados);
        return res.status(200).json({ status: 200, mensagem: "Nota atualizada com sucesso!" });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return res.status(400).json({ status: 400, mensagem: "Usuário não existe." });
        } else {
            return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log", error });
        }
    }
});

router.get('/notas-tecnicas/:id', async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);

    try {
        const nota = await NotaTecnica.findByPk(id, {
            attributes: { exclude: ['nota_criada_por'] },
            include: [{
                model: Usuario,
                as: 'nota_criado_por',
                attributes: ['usuario_id', 'usuario_nome']
            }]
        });

        if (!nota) {
            return res.status(200).json({ status: 404, mensagem: "Nota não encontrada" });
        }

        return res.status(200).json({ status: 200, mensagem: "Nota encontrada", dados: nota });
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

router.get('/notas-tecnicas', async (req: Request, res: Response) => {
    const itens: number = parseInt(req.query.itens as string) || 10;
    const pagina: number = parseInt(req.query.pagina as string) || 1;

    try {
        const notas = await NotaTecnica.findAndCountAll({
            limit: itens,
            offset: itens * (pagina - 1),
            attributes: { exclude: ['nota_criada_por'] },
            include: [{
                model: Usuario,
                as: 'nota_criado_por',
                attributes: ['usuario_id', 'usuario_nome']
            }]
        });

        if (notas.count === 0) {
            return res.status(200).json({ status: 200, mensagem: "Nenhuma nota registrada" });
        }

        const totalPaginas = Math.ceil(notas.count / itens);

        const links = {
            first: `/api/notas-tecnicas?itens=${itens}&pagina=1`,
            self: `/api/notas-tecnicas?itens=${itens}&pagina=${pagina}`,
            last: `/api/notas-tecnicas?itens=${itens}&pagina=${totalPaginas}`
        };

        return res.status(200).json({ status: 200, mensagem: "Notas encontradas", dados: notas.rows, links });
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

router.delete('/notas-tecnicas/:id', async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);
    try {
        const condition: WhereOptions = { nota_id: id };

        const resp = await NotaTecnica.destroy({ where: condition });

        if (resp) {
            return res.status(200).json({ status: 200, mensagem: "Nota apagada com sucesso." });
        } else {
            return res.status(404).json({ status: 404, mensagem: "Nota não encontrada." });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

router.get('/nota-sync', async (req: Request, res: Response) => {
    try {
        const tableName = NotaTecnica.getTableName();
        const tableExists = await sequelize.getQueryInterface().describeTable(tableName)
            .then(() => true)
            .catch(() => false);

        if (tableExists) {
            return res.status(200).json({ status: 200, mensagem: "Tabela já existe" });
        } else {
            await NotaTecnica.sync({ alter: true });
            return res.status(200).json({ status: 200, mensagem: "Tabela sincronizada" });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

export default router;