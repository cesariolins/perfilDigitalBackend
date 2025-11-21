const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware')

// Rotas públicas
router.post('/login', authController.login)

// Rotas protegidas (apenas admin pode registrar novos gestores)
router.post('/registrar', authMiddleware, authController.registrar)
router.get('/verificar', authMiddleware, authController.verificarToken)

module.exports = router
