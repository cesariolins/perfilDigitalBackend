const { v4: uuidv4 } = require('uuid')
const Respondente = require('../models/Respondente')
const RespostaPerfil = require('../models/RespostaPerfil')
const RespostaQuestionario = require('../models/RespostaQuestionario')
const Resultado = require('../models/Resultado')
const { calcularPontuacao, gerarRecomendacoes } = require('../utils/calcularPontuacao')
const { enviarCapiba } = require('../utils/capibaService') // Assumindo que você tem este serviço
const sequelize = require('../config/database') // Importar sequelize para transações
const { QueryTypes } = require('sequelize') // Para usar QueryTypes.INSERT, etc.

class QuestionarioController {
  // Valida CPF e verifica se já respondeu
  async validarCPF(req, res) {
    try {
      const { cpf } = req.body

      if (!cpf) {
        return res.status(400).json({
          success: false,
          message: 'CPF é obrigatório'
        })
      }

      // Remove formatação do CPF
      const cpfLimpo = cpf.replace(/\D/g, '')

      // Verifica se já existe respondente com esse CPF
      const respondente = await Respondente.findOne({ where: { cpf: cpfLimpo } })

      if (respondente) {
        return res.status(409).json({
          success: false,
          message: 'Este CPF já respondeu o questionário',
          jaRespondeu: true
        })
      }

      return res.status(200).json({
        success: true,
        message: 'CPF válido! Pode prosseguir com o questionário',
        jaRespondeu: false
      })
    } catch (error) {
      console.error('Erro ao validar CPF:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro ao validar CPF'
      })
    }
  }

  // Inicia o questionário (cria o respondente)
  async iniciarQuestionario(req, res) {
    try {
      const { cpf } = req.body

      if (!cpf) {
        return res.status(400).json({
          success: false,
          message: 'CPF é obrigatório'
        })
      }

      const cpfLimpo = cpf.replace(/\D/g, '')

      // Verifica novamente se não existe
      const existe = await Respondente.findOne({ where: { cpf: cpfLimpo } })
      if (existe) {
        return res.status(409).json({
          success: false,
          message: 'CPF já cadastrado'
        })
      }

      // Cria código anônimo único
      const codigoAnonimo = uuidv4()

      // Cria o respondente
      const respondente = await Respondente.create({
        cpf: cpfLimpo,
        codigo_anonimo: codigoAnonimo
      })

      return res.status(201).json({
        success: true,
        message: 'Questionário iniciado!',
        respondente_id: respondente.id,
        codigo_anonimo: respondente.codigo_anonimo
      })
    } catch (error) {
      console.error('Erro ao iniciar questionário:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro ao iniciar questionário'
      })
    }
  }

  // Salva a Seção 0 (Perfil do Participante) - Este método não será mais usado diretamente pelo frontend
  // O método `responderQuestionario` unificará o salvamento do perfil e das respostas
  async salvarPerfil(req, res) {
    return res.status(400).json({ success: false, message: 'Este endpoint não é mais usado. Use /responder.' })
  }

  // Salva as respostas do questionário - Este método não será mais usado diretamente pelo frontend
  // O método `responderQuestionario` unificará o salvamento do perfil e das respostas
  async salvarRespostas(req, res) {
    return res.status(400).json({ success: false, message: 'Este endpoint não é mais usado. Use /responder.' })
  }

  // Busca o resultado de um respondente
  async buscarResultado(req, res) {
    try {
      const { respondente_id } = req.params

      const resultado = await Resultado.findOne({
        where: { respondente_id },
        include: [
          { model: Respondente, attributes: ['cpf', 'codigo_anonimo'] },
          { model: RespostaPerfil },
          { model: RespostaQuestionario }
        ]
      })

      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Resultado não encontrado'
        })
      }

      return res.status(200).json({
        success: true,
        resultado
      })
    } catch (error) {
      console.error('Erro ao buscar resultado:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar resultado'
      })
    }
  }

  // Método unificado para responder o questionário completo
  async responderQuestionario(req, res) {
    const transaction = await sequelize.transaction()
    try {
      const { cpf, perfil, questionario, pontuacao_total } = req.body
      console.log('📝 Recebendo questionário completo...')

      if (!cpf || !perfil || !questionario || pontuacao_total === undefined) {
        await transaction.rollback()
        return res.status(400).json({ success: false, message: 'Dados incompletos para salvar o questionário.' })
      }

      const cpfLimpo = cpf.replace(/\D/g, '')

      // 1. Encontrar ou criar o Respondente
      let respondente = await Respondente.findOne({ where: { cpf: cpfLimpo }, transaction })

      if (!respondente) {
        // Se o respondente não existe (o que não deveria acontecer se o fluxo do frontend for correto),
        // cria um novo. Isso pode acontecer se o usuário pular a etapa de CPF.
        const codigoAnonimo = uuidv4()
        respondente = await Respondente.create({
          cpf: cpfLimpo,
          codigo_anonimo: codigoAnonimo
        }, { transaction })
        console.log('Respondente criado (não deveria ter sido necessário se o fluxo do frontend for seguido).')
      } else {
        // Se o respondente já existe, verifica se já respondeu o questionário completo
        const jaRespondeu = await Resultado.findOne({ where: { respondente_id: respondente.id }, transaction })
        if (jaRespondeu) {
          await transaction.rollback()
          return res.status(409).json({ success: false, message: 'Este CPF já respondeu o questionário completo.' })
        }
      }

      const respondente_id = respondente.id

      // 2. Salvar respostas de perfil
      await RespostaPerfil.create({
        respondente_id,
        idade: perfil.idade,
        genero: perfil.genero,
        regiao: perfil.regiao,
        localidade: perfil.localidade,
        ocupacao: perfil.ocupacao,
        escolaridade: perfil.escolaridade,
        renda: perfil.renda,
        dispositivo: perfil.dispositivo,
        horario: perfil.horario,
        uso_principal: perfil.uso_principal
      }, { transaction })

      console.log('Perfil salvo')

      // 3. Salvar respostas do questionário
      // O objeto `questionario` já vem no formato { pergunta_1: pontos, pergunta_2: pontos, ... }
      await RespostaQuestionario.create({
        respondente_id,
        ...questionario // Espalha todas as perguntas e seus pontos
      }, { transaction })

      console.log('Questionário salvo')

      // 4. Calcular e salvar resultado
      const { classificacao } = calcularPontuacao(questionario) // calcularPontuacao agora recebe o objeto questionario
      const recomendacoes = gerarRecomendacoes(classificacao)

      await Resultado.create({
        respondente_id,
        pontuacao_total,
        classificacao,
        recomendacoes // Salva as recomendações também
      }, { transaction })

      console.log('Resultado salvo')

      // 5. Enviar Capiba (se aplicável)
      // await enviarCapiba(respondente.cpf, 10) // Exemplo: envia 10 capibas
      // console.log('10 Capibas enviadas para o CPF:', respondente.cpf)

      // Commit da transação
      await transaction.commit()

      res.json({
        success: true,
        message: 'Respostas salvas com sucesso!',
        data: {
          pontuacao: pontuacao_total,
          classificacao,
          recomendacoes
        }
      })

    } catch (error) {
      await transaction.rollback()
      console.error('❌ Erro ao salvar questionário:', error)
      res.status(500).json({
        success: false,
        message: 'Erro ao salvar questionário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

module.exports = new QuestionarioController()
