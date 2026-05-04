const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tienda = sequelize.define('Tienda', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ubicacion: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'tiendas',
  timestamps: true
});

module.exports = Tienda;
