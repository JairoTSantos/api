import { Router } from 'express';

import NotaTecnica from '../modelos/notaTecnica.modelo';
import Usuario from '../modelos/usuario.modelo';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.get('/proposicoes', async (req, res) => {

    const autor = req.query.autor || process.env.ID_DEPUTAD0;
    const tipo = req.query.tipo || 'PL';
    const ano = req.query.ano || new Date().getFullYear().toString();
    const itens = req.query.itens || 10;
    const ordem = req.query.ordem || 'DESC';
    const pagina = req.query.pagina || 1;
    const ordernarPor = req.query.ordernarPor || 'id'

    const url = `https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=${tipo}&ano=${ano}&idDeputadoAutor=${autor}&itens=${itens}&ordem=${ordem}&ordenarPor=${ordernarPor}&pagina=${pagina}`;

    try {
        const respostaAPI = await axios.get(url);

        const proposicoes = await Promise.all(respostaAPI.data.dados.map(async (proposicao: any) => {
            const detalhes = await getDetalhe(proposicao.uri);
            const autores = await getAutor(proposicao.id);
            const principal = await getPrincipal(proposicao.id);
            const nota = await getNota(proposicao.id);
            
            const proposicao_autoria = autores.some((autor: any) =>
                autor.nome_autor === process.env.NOME_DEPUTADO && autor.assinatura === 1 && autor.proponente === 1
            );
            
            return {
                proposicao_id: proposicao.id,
                proposicao_titulo: `${proposicao.siglaTipo} ${proposicao.numero}/${proposicao.ano}`,
                proposicao_ementa: proposicao.ementa,
                proposicao_site: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposicao.id}`,
                proposicao_informacoes: detalhes,
                proposicao_autoria: proposicao_autoria,
                proposicoes_autores: autores,
                proposicao_principal: principal,
                proposicao_nota_tecnica: nota
            }

        }));

        let links: any = [];

        const linkLast = respostaAPI.data.links.find((link: { rel: string; }) => link.rel === 'last');

        if (linkLast) {
            const ultimaPagina = linkLast.href;
            const urlParams = new URLSearchParams(ultimaPagina.split('?')[1]);
            const lastpagina = urlParams.get('pagina');

            links = {
                first: `/api/proposicoes?tipo=${tipo}&ano=${ano}&itens=${itens}&pagina=${pagina}&ordem=${ordem}`,
                self: `/api/proposicoes?tipo=${tipo}&ano=${ano}&itens=${itens}&pagina=${pagina}&ordem=${ordem}`,
                last: `/api/proposicoes?tipo=${tipo}&ano=${ano}&itens=${itens}&pagina=${lastpagina}&ordem=${ordem}`,
            };
        } else {
            links = {
                first: `/api/proposicoes?tipo=${tipo}&ano=${ano}&itens=${itens}&pagina=${pagina}&ordem=${ordem}`,
                self: `/api/proposicoes?tipo=${tipo}&ano=${ano}&itens=${itens}&pagina=${pagina}&ordem=${ordem}`,
                last: `/api/proposicoes?tipo=${tipo}&ano=${ano}&itens=${itens}&pagina=${pagina}&ordem=${ordem}`,
            };
        }

        return res.status(200).json({ status: 200, mensagem: `Proposições de autoria e co-autoria do deputado(a): ${process.env.NOME_DEPUTADO}`, data: proposicoes, links: links });
    } catch (error) {
       
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }

});

router.get('/proposicoes-autores/:id', async (req, res) => {
    const id: number = parseInt(req.params.id, 10);
    try {
        const autores: any = await getAutor(id);
        return res.status(200).json({ status: 200, mensagem: `Autores da proposição: ${id}`, data: autores });
    } catch (error: any) {
        if (error.response.status === 404) {
            return res.status(200).json({ status: 200, mensagem: "Proposição não encontrada" });
        }
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log" });
    }
});

router.get('/medidas-provisorias/', async (req, res) => {
    const ano: number = isNaN(parseInt(req.query.ano as string, 10)) ? new Date().getFullYear() : parseInt(req.query.ano as string, 10);

    const itensPorPagina: number = parseInt(req.query.itens as string) || 10;
    const pagina: number = parseInt(req.query.pagina as string) || 1;

    try {
        const respostaAPI = await axios.get(`https://legis.senado.leg.br/dadosabertos/materia/pesquisa/lista?sigla=mpv&ano=${ano}`);

        if (!respostaAPI.data.PesquisaBasicaMateria.Materias) {
            return res.status(200).json({ status: 200, mensagem: 'Nenhuma MP encontrada' });
        }

        const mps = await Promise.all(respostaAPI.data.PesquisaBasicaMateria.Materias.Materia.map(async (mp: any) => {
            const emendas = await emendasMP(mp.Codigo);
            const emenda_autoria = emendas.some((emenda: any) => emenda.emenda_autoria);
            return {
                mp_id: mp.Codigo,
                mp_numero: mp.Numero,
                mp_sigla: mp.Sigla,
                mp_ano: mp.Ano,
                mp_titulo: mp.DescricaoIdentificacao,
                mp_ementa: mp.Ementa,
                mp_apresentacao: mp.Data,
                mp_prazo_emenda: new Date(new Date(mp.Data).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                mp_link: `https://www.congressonacional.leg.br/materias/medidas-provisorias/-/mpv/${mp.Codigo}`,
                mp_emenda_deputado: emenda_autoria,
                mp_emendas: emendas
            };
        }));

        mps.sort((a: any, b: any) => b.mp_numero - a.mp_numero);

        const totalMps = mps.length;
        const totalPaginas = Math.ceil(totalMps / itensPorPagina);
        const mpsPaginadas = mps.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina);

        const links = {
            first: `/api/medidas-provisorias?itens=${itensPorPagina}&pagina=1&ano=${ano}`,
            self: `/api/medidas-provisorias?itens=${itensPorPagina}&pagina=${pagina}&ano=${ano}`,
            last: `/api/medidas-provisorias?itens=${itensPorPagina}&pagina=${totalPaginas}&ano=${ano}`
        };

        if (pagina > totalPaginas) {
            return res.status(200).json({ status: 200, message: 'Nenhuma MP encontrada' });
        }

        return res.status(200).json({ status: 200, message: 'OK', data: mpsPaginadas, links: links });
    } catch (error) {
        return res.status(500).json({ status: 500, mensagem: "Erro interno do servidor. Consulte o log", error });
    }


});


async function getNota(proposicao: string) {
    try {
        const nota = await NotaTecnica.findOne({
            where: { nota_proposicao: proposicao },
            attributes: { exclude: ['nota_criada_por', 'nota_proposicao'] },
            include: [{
                model: Usuario,
                as: 'nota_criado_por',
                attributes: ['usuario_id', 'usuario_nome']
            }]
        });

        if (!nota) {
            return [];
        }

        return nota;
    } catch (error) {
        throw error;
    }
}

async function getPrincipal(id: number) {
    try {
        const uri = `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${id}`
        const response = await axios.get(uri);
        const dados = response.data;
        if (dados.dados.uriPropPrincipal === null) {
            if (dados.dados.id !== id) {
                const autores = await getAutor(dados.dados.id);
                return {
                    proposicao_id: dados.dados.id,
                    proposicao_titulo: dados.dados.siglaTipo + ' ' + dados.dados.numero + '/' + dados.dados.ano,
                    proposicao_numero: dados.dados.numero,
                    proposicao_sigla: dados.dados.siglaTipo,
                    proposicao_ementa: dados.dados.ementa,
                    proposicao_autores: autores
                };
            }
        } else {
            return await getPrincipal(dados.dados.uriPropPrincipal.split('/').pop());
        }
    } catch (error) {
        throw error;
    }
}

async function emendasMP(id_mp: any) {
    try {
        const response = await axios.get(`https://legis.senado.leg.br/dadosabertos/materia/emendas/${id_mp}`);
        const emendasAPI = response.data.EmendaMateria.Materia.Emendas;
        if (emendasAPI) {
            const emendas = emendasAPI.Emenda.map((emenda: any) => {
                const autoriaEmenda = emenda.AutoriaEmenda;
                const autor = autoriaEmenda ? autoriaEmenda.Autor[0] : null;
                const identificacaoParlamentar = autor ? autor.IdentificacaoParlamentar : null;

                return {
                    emenda_id: emenda.CodigoEmenda,
                    emenda_numero: emenda.NumeroEmenda,
                    emenda_apresentacao: emenda.DataApresentacao,
                    emenda_turno: emenda.DescricaoTurno,
                    emenda_ementa: (emenda.TextosEmenda && emenda.TextosEmenda.TextoEmenda) ? emenda.TextosEmenda.TextoEmenda[0].DescricaoTexto : '',
                    emenda_documento: (emenda.TextosEmenda && emenda.TextosEmenda.TextoEmenda) ? emenda.TextosEmenda.TextoEmenda[0].UrlTexto : '',
                    emenda_autor: autor ? autor.NomeAutor : '',
                    emenda_autor_partido: identificacaoParlamentar ? identificacaoParlamentar.SiglaPartidoParlamentar : '',
                    emenda_autor_estado: identificacaoParlamentar ? identificacaoParlamentar.UfParlamentar : '',
                    emenda_autoria: (autor && autor.NomeAutor === process.env.NOME_DEPUTADO) ? true : false
                };
            });
            return emendas;
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function getDetalhe(url: string) {
    try {
        const respostaAPI = await axios.get(url);
        const dados = respostaAPI.data.dados;
        const detalhes = {
            proposicao_apresentacao: dados.dataApresentacao,
            proposicao_documento: dados.urlInteiroTeor,
            proposicao_arquivada: dados.statusProposicao.descricaoSituacao === 'Arquivada' || dados.statusProposicao.descricaoSituacao === 'Transformada em norma jurídica' ? 'true' : 'false',
            proposicao_tipo: dados.descricaoTipo
        };
        return detalhes;
    } catch (error) {
        throw error;
    }
}

async function getAutor(id: number) {
    try {
        const respostaAPI = await axios.get(`https://dadosabertos.camara.leg.br/api/v2/proposicoes/${id}/autores`);
        const dados = respostaAPI.data.dados;
        const autores = dados.map((autor: any) => {
            const id_autor = autor.uri.split('/').pop();
            return {
                id_autor: id_autor,
                nome_autor: autor.nome,
                pagina_autor: autor.codTipo === 10000 ? `https://www.camara.leg.br/deputados/${id_autor}` : "",
                assinatura: autor.ordemAssinatura,
                proponente: autor.proponente
            }
        })
        return autores;
    } catch (error) {
        throw error;
    }
}

export default router;