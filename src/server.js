const express = require('express')
const cors = require('cors')
require('dotenv').config()
const sequelize = require('./config/database')

// Importa as rotas
const authRoutes = require('./routes/authRoutes')
const questionarioRoutes = require('./routes/questionarioRoutes') // ← REMOVA A DUPLICAÇÃO
const dashboardRoutes = require('./routes/dashboardRoutes')

const app = express()

// Middlewares globais
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })
}

// Rotas
app.use('/api/auth', authRoutes)
app.use('/api/questionario', questionarioRoutes) // ← SÓ UMA VEZ
app.use('/api/dashboard', dashboardRoutes)

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DigiSaúde API está rodando!',
    timestamp: new Date()
  })
})

// Rota 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Rota não encontrada' 
  })
})

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro global:', err)
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Inicia o servidor
const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)

  // Testa conexão com banco
  try {
    await sequelize.authenticate()
    console.log('✅ Conexão com MySQL estabelecida com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao conectar no banco:', error)
  }
})
