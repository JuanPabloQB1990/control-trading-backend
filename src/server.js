const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/operaciones', require('./routes/operacionRoutes'));
app.use('/api/timeframes', require('./routes/timeframeRoutes'));
app.use('/api/sesiones', require('./routes/sesionRoutes'));
app.use('/api/pares', require('./routes/parRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trading')
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, '0.0.0.0', () => console.log(`Servidor escuchando en puerto ${PORT}`));
  })
  .catch((error) => {
    console.error('Error conectando MongoDB:', error);
    process.exit(1);
  });
