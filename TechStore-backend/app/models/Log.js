const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recurso: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recurso_id: {
    type: DataTypes.INTEGER
  },
  detalles: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'logs_auditoria',
  timestamps: true,
  createdAt: 'fecha',
  updatedAt: false
});

Usuario.hasMany(Log, { foreignKey: 'usuario_id' });
Log.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = Log;
