const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tienda = require('./Tienda');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  es_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tienda_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Tienda,
      key: 'id'
    }
  }
}, {
  tableName: 'productos',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

Tienda.hasMany(Producto, { foreignKey: 'tienda_id' });
Producto.belongsTo(Tienda, { foreignKey: 'tienda_id' });

module.exports = Producto;
