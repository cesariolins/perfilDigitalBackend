const express = require('express')
const router = express.Router()
const questionarioController = require('../controllers/questionarioController')

// Rotas públicas (cidadãos respondendo)
router.post('/validar-cpf', questionarioController.validarCPF)
router.post('/iniciar', questionarioController.iniciarQuestionario)
router.post('/perfil', questionarioController.salvarPerfil)
router.post('/respostas', questionarioController.salvarRespostas)
router.post('/responder', questionarioController.responderQuestionario)
router.get('/resultado/:respondente_id', questionarioController.buscarResultado)

module.exports = router
