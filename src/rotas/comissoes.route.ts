import express, { Request, Response } from 'express';

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/comissoes', async (req: Request, res: Response) => {
    const autor = req.query.autor || process.env.ID_DEPUTAD0;
    const ativo = req.query.ativo === 'false' ? false : true;

    const url = `https://dadosabertos.camara.leg.br/api/v2/deputados/${autor}/orgaos?dataInicio=${process.env.PRIMEIRA_LEGISLATURA}&itens=100&ordem=ASC&ordenarPor=idOrgao`;

    try {
        const respostaAPI = axios.get(url);

        let membro_ativo = true;
        const comissoes = (await respostaAPI).data.dados.map((comissao: any) => {
            
            membro_ativo = !comissao.dataFim ? true : false;
            return {
                comissao_id: comissao.idOrgao,
                comissao_sigla: comissao.siglaOrgao,
                comissao_nome: comissao.nomeOrgao,
                comissao_apelido: comissao.nomePublicacao,
                comissao_site: `https://www.camara.leg.br/${comissao.siglaOrgao}`,
                comissao_cargo: comissao.titulo,
                comissao_inicio: comissao.dataInicio,
                comissao_fim: comissao.dataFim,
                comissao_ativo: membro_ativo
            }
            
        });

        if (ativo) {
            const comissoesFiltradas = comissoes.filter((comissao: any) => comissao.comissao_ativo && comissao.comissao_id !== 180);
            return res.status(200).json({ status: 200, mensagem: `Comissões do deputado(a): ${process.env.NOME_DEPUTADO}`, data: comissoesFiltradas });
        } else {
            const comissoesFiltradas = comissoes.filter((comissao: any) => comissao.comissao_id !== 180);
            return res.status(200).json({ status: 200, mensagem: `Comissões do deputado(a): ${process.env.NOME_DEPUTADO}`, data: comissoesFiltradas });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
}); 

export default router;