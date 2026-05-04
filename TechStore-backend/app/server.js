const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
require('./models/Tienda');
require('./models/Usuario');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida exitosamente.');
    
    await sequelize.sync({ force: false });
    console.log('Modelos sincronizados con la base de datos.');

    const Tienda = require('./models/Tienda');
    const defaultTienda = await Tienda.findByPk(1);
    if (!defaultTienda) {
      await Tienda.create({ id: 1, nombre: 'Tienda Central', ubicacion: 'Sede Principal' });
      console.log('Tienda por defecto creada.');
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

startServer();
