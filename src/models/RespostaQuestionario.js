const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Respondente = require('./Respondente')

const RespostaQuestionario = sequelize.define('RespostaQuestionario', {
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
  pergunta_1: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_2: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_3: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_4: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_5: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_6: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_7: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_8: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_9: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_10: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_11: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_12: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_13: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_14: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_15: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_16: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_17: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_18: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_19: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
  pergunta_20: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } }
}, {
  tableName: 'respostas_questionario',
  timestamps: true,
  updatedAt: false
})

// Relacionamento
RespostaQuestionario.belongsTo(Respondente, { foreignKey: 'respondente_id', as: 'respondente' })
Respondente.hasOne(RespostaQuestionario, { foreignKey: 'respondente_id', as: 'respostas' })

module.exports = RespostaQuestionario
