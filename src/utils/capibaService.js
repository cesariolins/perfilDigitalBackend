const sequelize = require('../config/database')

async function enviarCapiba(cpf, respondente_id) {
  try {
    const valorCapiba = 10.00 


    await registrarBonificacao(respondente_id, cpf, valorCapiba, 'pendente', 'Integração com API da Capiba em desenvolvimento')

    return { success: true, valor: valorCapiba }

  } catch (error) {
    console.error('❌ Erro ao enviar Capiba:', error)
    
    // Registra o erro no banco
    await registrarBonificacao(respondente_id, cpf, 10.00, 'erro', error.message)
    
    throw error
  }
}


async function registrarBonificacao(respondente_id, cpf, valor, status, mensagemErro = null) {
  try {
    await sequelize.query(`
      INSERT INTO bonificacoes (respondente_id, cpf, valor_capiba, status, mensagem_erro)
      VALUES (:respondente_id, :cpf, :valor, :status, :mensagem_erro)
    `, {
      replacements: {
        respondente_id,
        cpf,
        valor,
        status,
        mensagem_erro: mensagemErro
      },
      type: sequelize.QueryTypes.INSERT
    })
  } catch (error) {
    console.error('Erro ao registrar bonificação:', error)
  }
}


async function consultarBonificacoes(cpf) {
  try {
    const bonificacoes = await sequelize.query(`
      SELECT * FROM bonificacoes
      WHERE cpf = :cpf
      ORDER BY created_at DESC
    `, {
      replacements: { cpf },
      type: sequelize.QueryTypes.SELECT
    })

    return bonificacoes
  } catch (error) {
    console.error('Erro ao consultar bonificações:', error)
    return []
  }
}

module.exports = { 
  enviarCapiba, 
  registrarBonificacao,
  consultarBonificacoes
}
