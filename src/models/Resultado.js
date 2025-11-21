const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Respondente = require('./Respondente')

const Resultado = sequelize.define('Resultado', {
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
  pontuacao_total: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  classificacao: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  recomendacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'resultados',
  timestamps: true,
  updatedAt: false
})

// Relacionamento
Resultado.belongsTo(Respondente, { foreignKey: 'respondente_id', as: 'respondente' })
Respondente.hasOne(Resultado, { foreignKey: 'respondente_id', as: 'resultado' })

module.exports = Resultado
