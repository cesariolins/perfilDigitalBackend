const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Respondente = require('./Respondente')

const RespostaPerfil = sequelize.define('RespostaPerfil', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  respondente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'respondentes',
      key: 'id'
    }
  },
  idade: DataTypes.STRING(50),
  genero: DataTypes.STRING(50),
  regiao: DataTypes.STRING(50),
  localidade: DataTypes.STRING(50),
  ocupacao: DataTypes.STRING(100),
  escolaridade: DataTypes.STRING(100),
  renda: DataTypes.STRING(100),
  dispositivo: DataTypes.STRING(100),
  horario: DataTypes.STRING(50),
  uso_principal: DataTypes.STRING(100)
}, {
  tableName: 'respostas_perfil',
  timestamps: true,
  updatedAt: false
})

// Relacionamento
RespostaPerfil.belongsTo(Respondente, { foreignKey: 'respondente_id', as: 'respondente' })
Respondente.hasOne(RespostaPerfil, { foreignKey: 'respondente_id', as: 'perfil' })

module.exports = RespostaPerfil
