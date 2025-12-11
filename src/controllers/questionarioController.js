const { v4: uuidv4 } = require('uuid')
const Respondente = require('../models/Respondente')
const RespostaPerfil = require('../models/RespostaPerfil')
const RespostaQuestionario = require('../models/RespostaQuestionario')
const Resultado = require('../models/Resultado')
const { calcularPontuacao, gerarRecomendacoes } = require('../utils/calcularPontuacao')
const { enviarCapiba } = require('../utils/capibaService') 
const sequelize = require('../config/database')
const { QueryTypes } = require('sequelize') 

class QuestionarioController {

  async validarCPF(req, res) {
    try {
      const { cpf } = req.body

      if (!cpf) {
        return res.status(400).json({
          success: false,
          message: 'CPF é obrigatório'
        })
      }


      const cpfLimpo = cpf.replace(/\D/g, '')


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


      const existe = await Respondente.findOne({ where: { cpf: cpfLimpo } })
      if (existe) {
        return res.status(409).json({
          success: false,
          message: 'CPF já cadastrado'
        })
      }

      const codigoAnonimo = uuidv4()


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

  async salvarPerfil(req, res) {
    return res.status(400).json({ success: false, message: 'Este endpoint não é mais usado. Use /responder.' })
  }


  async salvarRespostas(req, res) {
    return res.status(400).json({ success: false, message: 'Este endpoint não é mais usado. Use /responder.' })
  }


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


      let respondente = await Respondente.findOne({ where: { cpf: cpfLimpo }, transaction })

      if (!respondente) {

        const codigoAnonimo = uuidv4()
        respondente = await Respondente.create({
          cpf: cpfLimpo,
          codigo_anonimo: codigoAnonimo
        }, { transaction })
        console.log('Respondente criado (não deveria ter sido necessário se o fluxo do frontend for seguido).')
      } else {

        const jaRespondeu = await Resultado.findOne({ where: { respondente_id: respondente.id }, transaction })
        if (jaRespondeu) {
          await transaction.rollback()
          return res.status(409).json({ success: false, message: 'Este CPF já respondeu o questionário completo.' })
        }
      }

      const respondente_id = respondente.id
  
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


      await RespostaQuestionario.create({
        respondente_id,
        ...questionario
      }, { transaction })

      console.log('Questionário salvo')


      const { classificacao } = calcularPontuacao(questionario)
      const recomendacoes = gerarRecomendacoes(classificacao)

      await Resultado.create({
        respondente_id,
        pontuacao_total,
        classificacao,
        recomendacoes
      }, { transaction })

      console.log('Resultado salvo')


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
