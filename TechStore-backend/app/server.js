const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
require('./models/Tienda');
require('./models/Usuario');
require('./models/Rol');
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

app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/tiendas', tiendasRoutes);

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

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

startServer();
