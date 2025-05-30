/************************************************
 * backend/models/Operation.js
 ************************************************/
const mongoose = require('mongoose');

const OperationSchema = new mongoose.Schema({
    userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    canal:              { type: String },
    plataforma:         { type: String },
    ordenNum:           { type: Number },
    tipoActivo:         { type: String },   // "Compra" o "Venta"
    activo:             { type: String },   // USDT, BTC, etc.
    moneda:             { type: String },   // COP, USD, etc.
    monto:              { type: Number },   // Equivale a "precio" si así lo deseas
    cantidad:           { type: Number },
    total:              { type: Number },
    comision:           { type: Number },

    // Datos Titular Exchange
    titularNombre:      { type: String },
    titularTipoID:      { type: String },
    titularDocumento:   { type: String },
    titularDireccion:   { type: String },

    // Datos del Tercero/Pago
    terceroNombre:      { type: String },
    terceroTipoID:      { type: String },
    terceroDocumento:   { type: String },

    // Datos de Pago
    cuentaOrigen:       { type: String },
    cuentaDestino:      { type: String },
    referenciaPago:     { type: String },
    estadoPago:         { type: String },

    // Fecha que antes venía en un solo campo,
    // ahora se compone de día, mes, año
    fecha:              { type: Date },

    // Campo para la imagen (ruta en el servidor)
    receiptImage:       { type: String },

    // NUEVO: campo para "borrado fantasma"
    hidden: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Operation', OperationSchema);
