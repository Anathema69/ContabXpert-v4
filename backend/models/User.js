// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    fullName: { type: String },
    telefono: { type: String },
    // Nuevos campos:
    docType: { type: String },     // Ej: DNI, CE, PASAPORTE, etc.
    docNumber: { type: String },   // Campo alfanumérico para el número de documento
    direccion: { type: String },   // Dirección del usuario
    date_last_update: { type: Date }
}, {
    collection: 'users'
});

module.exports = mongoose.model('User', UserSchema);
