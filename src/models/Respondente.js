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
    type: DataTypes.STRING(11), 
    allowNull: false,
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
  timestamps: false 
})

module.exports = Respondente
