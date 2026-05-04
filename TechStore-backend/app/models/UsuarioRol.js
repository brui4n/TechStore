const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Rol = require('./Rol');

const UsuarioRol = sequelize.define('UsuarioRol', {
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
  rol_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Rol,
      key: 'id'
    }
  },
  asignado_por: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'usuario_roles',
  timestamps: true,
  createdAt: 'fecha_asignacion',
  updatedAt: false
});

Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'usuario_id' });
Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'rol_id' });

module.exports = UsuarioRol;
