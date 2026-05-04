const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tienda = require('./Tienda');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre_completo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tienda_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Tienda,
      key: 'id'
    }
  },
  mfa_habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mfa_secret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  intentos_fallidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bloqueado_hasta: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: false
});

// Relationships
Tienda.hasMany(Usuario, { foreignKey: 'tienda_id' });
Usuario.belongsTo(Tienda, { foreignKey: 'tienda_id' });

module.exports = Usuario;
