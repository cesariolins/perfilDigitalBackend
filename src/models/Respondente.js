// backend/src/models/Respondente.js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Respondente = sequelize.define('Respondente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  cpf: {
    type: DataTypes.STRING(11), // CPF sem formatação tem 11 dígitos
    allowNull: false, // ESSA LINHA É CRÍTICA!
    unique: true
  },
  codigo_anonimo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'respondentes',
  timestamps: false // Se você não quer created_at e updated_at automáticos
})

module.exports = Respondente
