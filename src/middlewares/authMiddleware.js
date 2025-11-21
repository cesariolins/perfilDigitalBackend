const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')

const authMiddleware = async (req, res, next) => {
  try {
    // Pega o token do header
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token não fornecido' 
      })
    }

    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Busca o usuário
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['senha'] }
    })

    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      })
    }

    // Adiciona o usuário na requisição
    req.usuario = usuario
    next()
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido ou expirado' 
    })
  }
}

module.exports = authMiddleware
