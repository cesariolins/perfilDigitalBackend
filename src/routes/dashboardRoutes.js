// backend/routes/dashboardRoutes.js
const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')
const authMiddleware = require('../middlewares/authMiddleware')

// Todas as rotas do dashboard são protegidas
router.use(authMiddleware)

router.get('/estatisticas', dashboardController.estatisticasGerais)
router.get('/relatorio', dashboardController.relatorioDetalhado)
router.get('/graficos', dashboardController.dadosGraficos)
router.get('/relatorio-ia', dashboardController.gerarRelatorioIA) // ← NOVO
router.get('/exportar', dashboardController.exportarExcel) // ← ATUALIZADO

module.exports = router
