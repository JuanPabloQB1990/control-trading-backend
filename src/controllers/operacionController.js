const Operacion = require('../models/operacionModel');
const { validateRequiredString } = require('../validators/validation');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const getAll = async (_req, res, next) => {
  try {
    const operaciones = await Operacion.find().populate(['sesion', 'par', 'timeframeLiquidez', 'timeframeObjetivo']);
    res.json(operaciones);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const operacion = await Operacion.findById(req.params.id).populate(['sesion', 'par', 'timeframeLiquidez', 'timeframeObjetivo']);
    if (!operacion) {
      return res.status(404).json({ message: 'Operación no encontrada' });
    }
    res.json(operacion);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (!validateRequiredString(payload.descripcion)) {
      return res.status(400).json({
        message: 'La descripción es obligatoria'
      });
    }

    if (payload.fechaHora) {
      payload.fechaHora = dayjs
        .tz(payload.fechaHora, 'America/Bogota')
        .toDate();
    }

    const operacion = await Operacion.create(payload);

    const populated = await operacion.populate([
      'sesion',
      'par',
      'timeframeLiquidez',
      'timeframeObjetivo'
    ]);

    res.status(201).json(populated);

  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.fechaHora) {
      payload.fechaHora = dayjs
        .tz(payload.fechaHora, 'America/Bogota')
        .toDate();
    }

    const operacion = await Operacion.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true
      }
    );

    if (!operacion) {
      return res.status(404).json({
        message: 'Operación no encontrada'
      });
    }

    const populated = await operacion.populate([
      'sesion',
      'par',
      'timeframeLiquidez',
      'timeframeObjetivo'
    ]);

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const operacion = await Operacion.findByIdAndDelete(req.params.id);
    if (!operacion) {
      return res.status(404).json({ message: 'Operación no encontrada' });
    }
    res.json({ message: 'Operación eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
