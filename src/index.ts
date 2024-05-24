import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import verificarToken from './middleware/auth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ status: 400, message: 'Formato de JSON não aceito' });
    }
    next();
});

app.get(['/', '/api'], (req: Request, res: Response) => {
    res.status(200).json({ status: 200, mensagem: "API em funcionamento. Consulte a documentação em /api-docs" });
});

import loginRoutes from './rotas/login.route';
app.use('/api', loginRoutes);

import usuarioRoutes from './rotas/usuario.route';
app.use('/api', verificarToken, usuarioRoutes);

import proposicoesRoutes from './rotas/proposicoes.route';
app.use('/api', verificarToken, proposicoesRoutes);

import notaRoutes from './rotas/nota_tecnica.route';
app.use('/api', verificarToken, notaRoutes);

import comissoesRoutes from './rotas/comissoes.route';
app.use('/api', verificarToken, comissoesRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ status: 404, mensagem: "Endpoint não encontrado" });
});

const PORT = process.env.PORT || 3000; // Use 3000 se a porta não estiver definida no arquivo .env
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
