const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')

class AuthController {
  // Login de gestor/admin
  async login(req, res) {
    try {
      const { cpf, senha } = req.body

      if (!cpf || !senha) {
        return res.status(400).json({
          success: false,
          message: 'CPF e senha são obrigatórios'
        })
      }

      // Remove formatação do CPF
      const cpfLimpo = cpf.replace(/\D/g, '')

      // Busca o usuário pelo CPF
      const usuario = await Usuario.findOne({ where: { cpf: cpfLimpo } })

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'CPF ou senha inválidos'
        })
      }

      // Compara a senha
      const senhaValida = await usuario.compararSenha(senha)

      if (!senhaValida) {
        return res.status(401).json({
          success: false,
          message: 'CPF ou senha inválidos'
        })
      }

      // Gera o token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          cpf: usuario.cpf, 
          tipo: usuario.tipo 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      )

      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
          instituicao: usuario.instituicao
        }
      })
    } catch (error) {
      console.error('Erro no login:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro ao realizar login'
      })
    }
  }

  // Registrar novo gestor (apenas admin pode fazer isso)
  async registrar(req, res) {
    try {
      const { nome, cpf, email, senha, tipo, instituicao } = req.body

      if (!nome || !cpf || !email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Dados incompletos'
        })
      }

      const cpfLimpo = cpf.replace(/\D/g, '')

      // Verifica se já existe
      const existe = await Usuario.findOne({ 
        where: { cpf: cpfLimpo } 
      })

      if (existe) {
        return res.status(409).json({
          success: false,
          message: 'CPF já cadastrado'
        })
      }

      // Cria o usuário
      const usuario = await Usuario.create({
        nome,
        cpf: cpfLimpo,
        email,
        senha,
        tipo: tipo || 'gestor',
        instituicao
      })

      return res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        }
      })
    } catch (error) {
      console.error('Erro ao registrar:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar usuário'
      })
    }
  }

  // Verifica se o token é válido
  async verificarToken(req, res) {
    try {
      return res.status(200).json({
        success: true,
        usuario: req.usuario
      })
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }
  }
}

module.exports = new AuthController()
