const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const isPlaceholderValue = (value) => !value || value.includes('your_') || value.includes('example');
const buildDataUrl = (file) => `data:${file.mimetype || 'image/png'};base64,${file.buffer.toString('base64')}`;

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se adjuntó ninguna imagen' });
    }

    const credentialsConfigured = !isPlaceholderValue(process.env.CLOUDINARY_CLOUD_NAME) && !isPlaceholderValue(process.env.CLOUDINARY_API_KEY) && !isPlaceholderValue(process.env.CLOUDINARY_API_SECRET);

    if (credentialsConfigured) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'trading' }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });

          stream.end(req.file.buffer);
        });

        return res.json({ imageUrl: uploadResult.secure_url, fallback: false });
      } catch (error) {
        console.error('Cloudinary upload failed, using fallback image URL:', error.message);
      }
    }

    const fallbackUrl = buildDataUrl(req.file);
    return res.json({ imageUrl: fallbackUrl, fallback: true, message: 'Se usó una imagen local porque Cloudinary no está disponible' });
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ message: 'Error subiendo imagen', error: error.message });
  }
});

module.exports = router;
