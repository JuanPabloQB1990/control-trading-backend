const Timeframe = require('../models/timeframeModel');

const getAll = async (_req, res, next) => {
  try {
    const timeframes = await Timeframe.find().sort({ nombre: 1 });
    res.json(timeframes);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const timeframe = await Timeframe.create(req.body);
    res.status(201).json(timeframe);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const timeframe = await Timeframe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!timeframe) return res.status(404).json({ message: 'Timeframe no encontrado' });
    res.json(timeframe);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const timeframe = await Timeframe.findByIdAndDelete(req.params.id);
    if (!timeframe) return res.status(404).json({ message: 'Timeframe no encontrado' });
    res.json({ message: 'Timeframe eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
