const Sesion = require('../models/sesionModel');

const getAll = async (_req, res, next) => {
  try {
    const sesiones = await Sesion.find().sort({ nombre: 1 });
    res.json(sesiones);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const sesion = await Sesion.create(req.body);
    res.status(201).json(sesion);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const sesion = await Sesion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sesion) return res.status(404).json({ message: 'Sesión no encontrada' });
    res.json(sesion);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const sesion = await Sesion.findByIdAndDelete(req.params.id);
    if (!sesion) return res.status(404).json({ message: 'Sesión no encontrada' });
    res.json({ message: 'Sesión eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
