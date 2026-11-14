const Operacion = require('../models/operacionModel');
const { validateRequiredString } = require('../validators/validation');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const cloudinary = require('cloudinary').v2;

dayjs.extend(utc);
dayjs.extend(timezone);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const isPlaceholderValue = (value) => !value || value.includes('your_') || value.includes('example');

const extractPublicIdFromUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes('cloudinary.com')) {
    return '';
  }

  try {
    const parsedUrl = new URL(imageUrl);
    const uploadIndex = parsedUrl.pathname.indexOf('/upload/');
    if (uploadIndex === -1) {
      return '';
    }

    let pathAfterUpload = parsedUrl.pathname.slice(uploadIndex + '/upload/'.length);
    const segments = pathAfterUpload.split('/').filter(Boolean);
    const transformedSegments = [];

    for (const segment of segments) {
      if (/^v\d+$/i.test(segment) || segment.includes(',') || /^c_[A-Za-z0-9_\-]+$/i.test(segment) || /^w_\d+$/i.test(segment) || /^h_\d+$/i.test(segment)) {
        continue;
      }
      transformedSegments.push(segment);
    }

    if (!transformedSegments.length) {
      return '';
    }

    const lastSegment = transformedSegments[transformedSegments.length - 1].replace(/\.[^/.]+$/, '');
    const remainder = transformedSegments.slice(0, -1);
    return [...remainder, lastSegment].filter(Boolean).join('/');
  } catch (error) {
    return '';
  }
};

const deleteCloudinaryImage = async (imageUrl, imagePublicId) => {
  const publicId = imagePublicId || extractPublicIdFromUrl(imageUrl);

  if (!publicId || !imageUrl || typeof imageUrl !== 'string' || imageUrl.startsWith('data:')) {
    return false;
  }

  const hasCredentials = !isPlaceholderValue(process.env.CLOUDINARY_CLOUD_NAME)
    && !isPlaceholderValue(process.env.CLOUDINARY_API_KEY)
    && !isPlaceholderValue(process.env.CLOUDINARY_API_SECRET);

  if (!hasCredentials) {
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result?.result === 'ok' || result?.result === 'not found';
  } catch (error) {
    console.error('Cloudinary image deletion failed:', error.message);
    return false;
  }
};

const getAll = async (_req, res, next) => {
  try {
    const operaciones = await Operacion.find().populate(['sesion', 'par', 'timeframeLiquidez', 'timeframeObjetivo', 'timeframeImbalanceEntrada']);
    res.json(operaciones);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const operacion = await Operacion.findById(req.params.id).populate(['sesion', 'par', 'timeframeLiquidez', 'timeframeObjetivo', 'timeframeImbalanceEntrada']);
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
      'timeframeObjetivo',
      'timeframeImbalanceEntrada'
    ]);

    res.status(201).json(populated);

  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    const existingOperacion = await Operacion.findById(req.params.id);

    if (!existingOperacion) {
      return res.status(404).json({
        message: 'Operación no encontrada'
      });
    }

    const previousImageUrl = existingOperacion.imagenUrl || '';
    const previousImagePublicId = existingOperacion.imagenPublicId || extractPublicIdFromUrl(previousImageUrl);
    const nextImageUrl = typeof payload.imagenUrl === 'string' ? payload.imagenUrl : previousImageUrl;
    const nextPublicId = payload.imagenPublicId || extractPublicIdFromUrl(nextImageUrl);

    if ((payload.imagenUrl === '' || payload.imagenUrl === null) && previousImageUrl) {
      await deleteCloudinaryImage(previousImageUrl, previousImagePublicId);
    } else if (previousImageUrl && nextImageUrl && previousImageUrl !== nextImageUrl && previousImagePublicId && nextPublicId && previousImagePublicId !== nextPublicId) {
      await deleteCloudinaryImage(previousImageUrl, previousImagePublicId);
    }

    if (payload.fechaHora) {
      payload.fechaHora = dayjs
        .tz(payload.fechaHora, 'America/Bogota')
        .toDate();
    }

    payload.imagenUrl = nextImageUrl || '';
    payload.imagenPublicId = nextPublicId || '';

    const operacion = await Operacion.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true
      }
    );

    const populated = await operacion.populate([
      'sesion',
      'par',
      'timeframeLiquidez',
      'timeframeObjetivo',
      'timeframeImbalanceEntrada'
    ]);

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const operacion = await Operacion.findById(req.params.id);
    if (!operacion) {
      return res.status(404).json({ message: 'Operación no encontrada' });
    }

    const imageUrl = operacion.imagenUrl || '';
    const imagePublicId = operacion.imagenPublicId || extractPublicIdFromUrl(imageUrl);

    await deleteCloudinaryImage(imageUrl, imagePublicId);
    await Operacion.findByIdAndDelete(req.params.id);

    res.json({ message: 'Operación eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  extractPublicIdFromUrl,
  deleteCloudinaryImage
};
