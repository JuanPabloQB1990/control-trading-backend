const mongoose = require('mongoose');

const operacionSchema = new mongoose.Schema({
  fechaHora: { type: Date, required: true },
  sesion: { type: mongoose.Schema.Types.ObjectId, ref: 'Sesion', required: true },
  par: { type: mongoose.Schema.Types.ObjectId, ref: 'Par', required: true },
  liquidez: { type: String, enum: ['imbalance', 'minimo', 'maximo'], required: true },
  liquidezEnSesion: { type: Boolean, required: true },
  timeframeLiquidez: { type: mongoose.Schema.Types.ObjectId, ref: 'Timeframe', required: true },
  quiebreTendenciaEntrada: { type: Boolean, required: true },
  descripcion: { type: String, trim: true },
  pipsStopLoss: { type: Number, required: true },
  pipsProfit: { type: Number, required: true },
  riesgoPorcentaje: { type: Number, required: true },
  profitPorcentaje: { type: Number, required: true },
  reliquida: { type: Boolean, required: true },
  pipsReliquidacion: { type: Number, default: 0 },
  ajusteStopLossPips: { type: Number, default: 0 },
  objetivoPrecio: { type: String, enum: ['imbalance', 'minimo', 'maximo'], required: true },
  timeframeObjetivo: { type: mongoose.Schema.Types.ObjectId, ref: 'Timeframe', required: true },
  alcanzaTarget: { type: Boolean, required: true },
  pipsObjetivo: { type: Number, required: true },
  porcentajeObjetivo: { type: Number, default: 0 },
  resultadoOperacion: { type: String, enum: ['ganada', 'breakEven', 'perdida'], default: '' },
  operacionTomada: { type: Boolean, default: false },
  imagenUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Operacion', operacionSchema);
