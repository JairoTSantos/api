const express = require('express');
const router = express.Router();
const addLog = require('../middleware/logger');
const auth = require('../middleware/auth');


router.get(['/', '/api'], (req, res) => {
    res.status(200).json({ status: 200, message: 'API em funcionamento.' });
});

const loginRoutes = require('./login.route');
router.use('/api', loginRoutes);

const usuarioRoutes = require('./usuario.route');
router.use('/api', auth, usuarioRoutes);

const orgaoRoutes = require('./orgao.route');
router.use('/api', auth, orgaoRoutes);

const pessoaRoutes = require('./pessoa.route');
router.use('/api', auth, pessoaRoutes);

const TipoPessoaRoutes = require('./tipo_pessoa.route');
router.use('/api', auth, TipoPessoaRoutes);

const TipoOrgaoRoutes = require('./tipo_orgao.route');
router.use('/api', auth, TipoOrgaoRoutes);

const ProposicoesRoute = require('./proposicoes.route');
router.use('/api', auth, ProposicoesRoute);

const SyncRoutes = require('./sync.route');
router.use('/api', auth, SyncRoutes);

router.use((req, res) => {
    addLog('error_missing_route', `Endpoint não encontrado: ${req.method} - ${req.originalUrl}`);
    res.status(404).json({ status: 404, message: 'Endpoint não encontrado. Consulte a documentação em /api-docs' });
});

module.exports = router;