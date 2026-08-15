#!/usr/bin/env node
const mongoose = require('mongoose');
const Operacion = require('../src/models/operacionModel');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/control-trading';

async function run() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Conectado a la DB');

  const collection = Operacion.collection;

  try {
    const res = await collection.updateMany(
      {},
      [
        { $set: { liquidaUltimaVela2h: "$liquidaUltimaVela4h" } },
        { $unset: "liquidaUltimaVela4h" }
      ]
    );

    console.log('Update result:', res.result || res);
  } catch (err) {
    console.error('Error durante la migración:', err);
    // Fallback: intentar copia por documentos
    try {
      const docs = await collection.find({}, { projection: { liquidaUltimaVela4h: 1 } }).toArray();
      const bulk = docs.map(d => ({
        updateOne: {
          filter: { _id: d._id },
          update: { $set: { liquidaUltimaVela2h: d.liquidaUltimaVela4h }, $unset: { liquidaUltimaVela4h: "" } }
        }
      }));
      if (bulk.length > 0) {
        const res2 = await collection.bulkWrite(bulk);
        console.log('Fallback bulkWrite result:', res2);
      } else {
        console.log('No se encontraron documentos para migrar');
      }
    } catch (err2) {
      console.error('Fallback failed:', err2);
    }
  }

  await mongoose.disconnect();
  console.log('Desconectado. Migración finalizada.');
}

run().catch((e) => { console.error(e); process.exit(1); });
