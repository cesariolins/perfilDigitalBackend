const express = require('express')
const cors = require('cors')
require('dotenv').config() 

const sequelize = require('./config/database') 

require('./models/Respondente')
require('./models/RespostaPerfil')
require('./models/RespostaQuestionario')
require('./models/Resultado')
require('./models/Usuario')


const authRoutes = require('./routes/authRoutes')
const questionarioRoutes = require('./routes/questionarioRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

const app = express()

console.log('Auth Routes imported:', authRoutes instanceof express.Router);
console.log('Questionario Routes imported:', questionarioRoutes instanceof express.Router); 
console.log('Dashboard Routes imported:', dashboardRoutes instanceof express.Router); 


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}))
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 


if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })
}

// Rotas
app.use('/api/auth', authRoutes)
app.use('/api/questionario', questionarioRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Rota de teste de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DigiSaúde API está rodando!',
    timestamp: new Date()
  })
})


app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Rota não encontrada' 
  })
})


app.use((err, req, res, next) => {
  console.error('Erro global:', err)
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  })
})


const PORT = process.env.PORT || 10000 
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Frontend URL para CORS: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)


  try {
    await sequelize.authenticate()
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!')


    await sequelize.sync({ alter: true }) 
    console.log('✅ Models sincronizados com o banco de dados!')

  } catch (error) {
    console.error('❌ Erro ao conectar ou sincronizar o banco:', error)

  }
})
