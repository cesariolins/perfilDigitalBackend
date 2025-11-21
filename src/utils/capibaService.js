const sequelize = require('../config/database')

/**
 * Envia bonificação em Capiba (moeda digital do Recife)
 * para o CPF do cidadão que completou o questionário
 */

async function enviarCapiba(cpf, respondente_id) {
  try {
    const valorCapiba = 10.00 // R$ 10,00 em Capiba por questionário respondido

    // ====================================
    // AQUI VOCÊ VAI INTEGRAR COM A API DA CAPIBA
    // ====================================
    
    // Exemplo de integração (adapte conforme documentação da Capiba):
    /*
    const axios = require('axios')
    
    const response = await axios.post('https://api.capiba.recife.pe.gov.br/v1/transferencia', {
      cpf: cpf,
      valor: valorCapiba,
      descricao: 'Bonificação por participação no DigiSaúde'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CAPIBA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.data.success) {
      // Registra no banco que a bonificação foi enviada
      await registrarBonificacao(respondente_id, cpf, valorCapiba, 'enviado', null)
      console.log(`✅ Capiba enviada com sucesso para CPF: ${cpf}`)
    }
    */

    // POR ENQUANTO, vamos apenas registrar no banco como "pendente"
    // até você configurar a API real da Capiba
    await registrarBonificacao(respondente_id, cpf, valorCapiba, 'pendente', 'Integração com API da Capiba em desenvolvimento')

    return { success: true, valor: valorCapiba }

  } catch (error) {
    console.error('❌ Erro ao enviar Capiba:', error)
    
    // Registra o erro no banco
    await registrarBonificacao(respondente_id, cpf, 10.00, 'erro', error.message)
    
    throw error
  }
}

/**
 * Registra a bonificação no banco de dados
 */
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

/**
 * Consulta bonificações por CPF
 */
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
