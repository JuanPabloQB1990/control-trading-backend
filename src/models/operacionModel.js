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
  createdAtCol: { type: String, default: '' },
  updatedAtCol: { type: String, default: '' },
  resultadoOperacion: { type: String, enum: ['ganada', 'breakEven', 'perdida'], default: '' },
  operacionTomada: { type: Boolean, default: false },
  imagenUrl: { type: String, default: '' }
}, { timestamps: true });

function formatToBogotaISO(date) {
  try {
    const parts = date.toLocaleString('sv-SE', { timeZone: 'America/Bogota', hour12: false }).split(' '); // ['YYYY-MM-DD', 'HH:MM:SS']
    return `${parts[0]}T${parts[1]}-05:00`;
  } catch (e) {
    return '';
  }
}

operacionSchema.pre('save', function (next) {
  const now = new Date();
  const formatted = formatToBogotaISO(now);
  if (this.isNew) {
    this.createdAtCol = formatted;
  }
  this.updatedAtCol = formatted;
  next();
});

operacionSchema.pre('findOneAndUpdate', function (next) {
  const formatted = formatToBogotaISO(new Date());
  this._update = this._update || {};
  this._update.updatedAtCol = formatted;
  next();
});

module.exports = mongoose.model('Operacion', operacionSchema);
