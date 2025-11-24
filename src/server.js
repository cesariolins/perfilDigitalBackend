const express = require('express')
const cors = require('cors')
require('dotenv').config() 

const sequelize = require('./config/database') // Importa a instância do Sequelize
// Importa os models para que o Sequelize possa sincronizá-los
require('./models/Respondente')
require('./models/RespostaPerfil')
require('./models/RespostaQuestionario')
require('./models/Resultado')
require('./models/Usuario') // Se você tiver um model de usuário para o dashboard

// Importa as rotas
console.log('Attempting to mount /api/auth');
const authRoutes = require('./routes/authRoutes')
console.log('/api/auth mounted')

console.log('Attempting to mount /api/questionario');
const questionarioRoutes = require('./routes/questionarioRoutes')
console.log('/api/questionario mounted');

console.log('Attempting to mount /api/dashboard');
const dashboardRoutes = require('./routes/dashboardRoutes')
console.log('/api/dashboard mounted');

console.log('Auth Routes imported:', authRoutes instanceof express.Router); // Adicione esta linha
console.log('Questionario Routes imported:', questionarioRoutes instanceof express.Router); // Adicione esta linha
console.log('Dashboard Routes imported:', dashboardRoutes instanceof express.Router); // Adicione esta linha

const app = express()

// Middlewares globais
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Permite requisições do frontend
  credentials: true // Permite o envio de cookies/cabeçalhos de autorização
}))
app.use(express.json()) // Para parsear JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })) // Para parsear dados de formulário

// Log de requisições (apenas em desenvolvimento)
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

// Rota 404 (para rotas não encontradas)
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
    error: process.env.NODE_ENV === 'development' ? err.message : undefined // Mostra detalhes do erro apenas em dev
  })
})

// Inicia o servidor
const PORT = process.env.PORT || 10000 // Usa a porta do ambiente (Render) ou 10000 como fallback
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Frontend URL para CORS: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)

  // Testa conexão com banco e sincroniza os models
  try {
    await sequelize.authenticate()
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!')

    // Sincroniza os models com o banco de dados (cria tabelas se não existirem, ou as altera)
    // Use { alter: true } para tentar fazer alterações sem perder dados existentes.
    // Para o primeiro deploy, { force: true } também funcionaria, mas apagaria dados se já existissem.
    // IMPORTANTE: REMOVA OU COMENTE A LINHA ABAIXO APÓS O PRIMEIRO DEPLOY BEM SUCEDIDO
    // PARA EVITAR ALTERAÇÕES INDESEJADAS OU LENTIDÃO EM PRODUÇÃO!
    await sequelize.sync({ alter: true }) 
    console.log('✅ Models sincronizados com o banco de dados!')

  } catch (error) {
    console.error('❌ Erro ao conectar ou sincronizar o banco:', error)
    // Em produção, você pode querer sair do processo se o banco não conectar
    // process.exit(1); 
  }
})
