const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
require('./models/Tienda');
require('./models/Usuario');
require('./models/Rol');
require('./models/Permiso');
require('./models/RolPermiso');
require('./models/UsuarioRol');
require('./models/Producto');
require('./models/Log');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const rolesRoutes = require('./routes/roles');
const usersRoutes = require('./routes/users');
const productosRoutes = require('./routes/productos');
const tiendasRoutes = require('./routes/tiendas');
const logsRoutes = require('./routes/logs');

app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/tiendas', tiendasRoutes);
app.use('/api/logs', logsRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida exitosamente.');
    
    await sequelize.sync({ force: false });
    console.log('Modelos sincronizados con la base de datos.');

    const Tienda = require('./models/Tienda');
    const defaultTiendas = [
      { id: 1, nombre: 'Tienda Central', ubicacion: 'Sede Principal' },
      { id: 2, nombre: 'Tienda Norte', ubicacion: 'Sede Norte' },
      { id: 3, nombre: 'Tienda Sur', ubicacion: 'Sede Sur' }
    ];
    for (const t of defaultTiendas) {
      const exists = await Tienda.findByPk(t.id);
      if (!exists) {
        await Tienda.create(t);
      }
    }
    console.log('Tiendas base verificadas/creadas.');

    const Rol = require('./models/Rol');
    const defaultRoles = [
      { id: 1, nombre: 'Admin', descripcion: 'Administrador del Sistema' },
      { id: 2, nombre: 'Gerente', descripcion: 'Gerente de Tienda' },
      { id: 3, nombre: 'Empleado', descripcion: 'Empleado de Ventas' },
      { id: 4, nombre: 'Auditor', descripcion: 'Auditor del Sistema' },
    ];
    for (const rol of defaultRoles) {
      const exists = await Rol.findByPk(rol.id);
      if (!exists) {
        await Rol.create(rol);
      }
    }
    console.log('Roles verificados/creados.');

    const Permiso = require('./models/Permiso');
    const RolPermiso = require('./models/RolPermiso');
    const defaultPermisos = [
      { id: 1, nombre: 'manage_users', descripcion: 'Gestionar usuarios' },
      { id: 2, nombre: 'manage_roles', descripcion: 'Gestionar roles y permisos' },
      { id: 3, nombre: 'manage_tiendas', descripcion: 'Gestionar tiendas' },
      { id: 4, nombre: 'manage_inventory_global', descripcion: 'Gestionar inventario de todas las tiendas' },
      { id: 5, nombre: 'manage_inventory_local', descripcion: 'Gestionar inventario de la tienda local' },
      { id: 6, nombre: 'view_inventory_local', descripcion: 'Ver inventario de la tienda local y editar precio/stock' },
      { id: 7, nombre: 'view_inventory_global', descripcion: 'Ver inventario de todas las tiendas' },
      { id: 8, nombre: 'view_audit_logs', descripcion: 'Ver logs de auditoría' }
    ];

    for (const perm of defaultPermisos) {
      const exists = await Permiso.findByPk(perm.id);
      if (!exists) {
        await Permiso.create(perm);
      }
    }
    console.log('Permisos verificados/creados.');

    const mapRolesPermisos = {
      1: [1, 2, 3, 4, 7, 8],
      2: [5, 6, 8],
      3: [6],
      4: [7, 8]
    };

    for (const [rolId, permisosIds] of Object.entries(mapRolesPermisos)) {
      for (const permId of permisosIds) {
        const exists = await RolPermiso.findOne({ where: { rol_id: parseInt(rolId), permiso_id: permId } });
        if (!exists) {
          await RolPermiso.create({ rol_id: parseInt(rolId), permiso_id: permId });
        }
      }
    }
    console.log('Mapeo de Roles-Permisos verificado.');

    // Crear un Superadmin por defecto si no existe
    const Usuario = require('./models/Usuario');
    const UsuarioRol = require('./models/UsuarioRol');
    const bcrypt = require('bcrypt');
    
    const superAdminEmail = 'superadmin@techstore.com';
    const existingAdmin = await Usuario.findOne({ where: { email: superAdminEmail } });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@1234', 10);
      const newAdmin = await Usuario.create({
        email: superAdminEmail,
        password: hashedPassword,
        nombre_completo: 'Super Administrador',
        tienda_id: 1,
        // Al no tener mfa_secret, el sistema le pedirá configurarlo al primer inicio de sesión
      });
      
      const adminRole = await Rol.findOne({ where: { nombre: 'Admin' } });
      if (adminRole) {
        await UsuarioRol.create({ usuario_id: newAdmin.id, rol_id: adminRole.id });
        console.log('Usuario Superadmin creado exitosamente. (superadmin@techstore.com / Admin@1234)');
      }
    }

    const Producto = require('./models/Producto');
    const defaultProductos = [
      { id: 1, nombre: 'Laptop Pro X1', descripcion: 'Laptop de alta gama para profesionales', precio: 1500, stock: 15, es_premium: true, tienda_id: 1 },
      { id: 2, nombre: 'Mouse Inalámbrico G2', descripcion: 'Mouse ergonómico', precio: 25, stock: 50, es_premium: false, tienda_id: 1 },
      { id: 3, nombre: 'Teclado Mecánico RGB', descripcion: 'Teclado mecánico switch blue', precio: 85, stock: 30, es_premium: false, tienda_id: 2 }
    ];
    for (const prod of defaultProductos) {
      const exists = await Producto.findByPk(prod.id);
      if (!exists) {
        await Producto.create(prod);
      }
    }
    console.log('Productos por defecto verificados/creados.');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

startServer();
