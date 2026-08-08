const Par = require('../models/parModel');

const getAll = async (_req, res, next) => {
  try {
    const pares = await Par.find().sort({ nombre: 1 });
    res.json(pares);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const par = await Par.create(req.body);
    res.status(201).json(par);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const par = await Par.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!par) return res.status(404).json({ message: 'Par no encontrado' });
    res.json(par);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const par = await Par.findByIdAndDelete(req.params.id);
    if (!par) return res.status(404).json({ message: 'Par no encontrado' });
    res.json({ message: 'Par eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
