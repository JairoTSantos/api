const express = require('express');
const router = express.Router();
const ProposicaoController = require('../controllers/proposicoes.controller');


router.get('/proposicoes', ProposicaoController.ProposicoesDeputado);

router.get('/proposicao-principal', ProposicaoController.BuscarPrincipal);

router.get('/proposicao-apensados', ProposicaoController.BuscarApensadosDoGabinete);




module.exports = router;