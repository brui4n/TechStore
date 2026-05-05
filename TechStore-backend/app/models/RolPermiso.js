const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Rol = require('./Rol');
const Permiso = require('./Permiso');

const RolPermiso = sequelize.define('RolPermiso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rol_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Rol,
      key: 'id'
    }
  },
  permiso_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Permiso,
      key: 'id'
    }
  }
}, {
  tableName: 'roles_permisos',
  timestamps: false
});

Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: 'rol_id' });
Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: 'permiso_id' });

module.exports = RolPermiso;
