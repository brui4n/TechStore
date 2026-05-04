const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'roles',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: false
});

module.exports = Rol;
