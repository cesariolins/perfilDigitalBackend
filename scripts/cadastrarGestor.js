// backend/scripts/cadastrarGestor.js
const bcrypt = require('bcryptjs')
const mysql = require('mysql2/promise')
require('dotenv').config()

async function cadastrarGestor() {
  let connection
  
  try {
    // Conecta ao MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'digisaude'
    })

    console.log('✅ Conectado ao MySQL')

    // Dados do gestor REAL
    const nome = 'Gestor'
    const cpf = '11122233304'
    const email = 'gestor@governo.pe.gov.br'
    const senha = 'senha123'
    const tipo = 'gestor'
    const instituicao = 'Governo de Pernambuco'

    // Verifica se o CPF já existe
    const [existing] = await connection.execute(
      'SELECT id, nome FROM usuarios WHERE cpf = ?',
      [cpf]
    )

    if (existing.length > 0) {
      console.log('⚠️  CPF já cadastrado!')
      console.log('📋 Usuário existente:', existing[0].nome)
      await connection.end()
      return
    }

    // Gera o hash da senha com bcrypt
    const senhaHash = await bcrypt.hash(senha, 10)
    console.log('🔐 Senha hasheada com sucesso')

    // Insere o gestor no banco
    const [result] = await connection.execute(
      `INSERT INTO usuarios (nome, cpf, email, senha, tipo, instituicao) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, cpf, email, senhaHash, tipo, instituicao]
    )

    console.log('✅ Gestor cadastrado com sucesso no banco de dados!')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 DADOS DE ACESSO:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('   CPF: 11122233304')
    console.log('   CPF formatado: 111.222.333-04')
    console.log('   Senha: senha123')
    console.log('   Nome:', nome)
    console.log('   Tipo:', tipo)
    console.log('   Instituição:', instituicao)
    console.log('   ID no banco:', result.insertId)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    await connection.end()
    console.log('\n✅ Conexão encerrada')
    
  } catch (error) {
    console.error('❌ Erro ao cadastrar gestor:', error.message)
    if (connection) await connection.end()
    process.exit(1)
  }
}

cadastrarGestor()
