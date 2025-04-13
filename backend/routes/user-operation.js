/************************************************
 * backend/routes/user-operation.js
 ************************************************/
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

const Operation = require('../models/Operation');
const User = require('../models/User');

// Configuración de Multer para guardar archivos en /uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const userId = req.user.id;
        const extension = path.extname(file.originalname);
        const timestamp = Date.now();
        const newFilename = `constancia_${userId}_${timestamp}${extension}`;
        cb(null, newFilename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'), false);
        }
    }
});

/**
 * POST /api/operation/register
 * Registra una operación.
 * Se espera que la fecha de operación se envíe en tres campos:
 * - fechaPagoDia
 * - fechaPagoMesHidden  (valor numérico: 1-12)
 * - fechaPagoAnio
 */
router.post(
    '/register',
    authMiddleware,
    upload.single('receiptImage'),
    async (req, res) => {
        try {
            const userId = req.user.id;
            // Verifica que el usuario exista
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Extraer campos del body
            const {
                canal,
                plataforma,
                ordenNum,
                tipoActivo,
                activo,
                moneda,
                monto,
                cantidad,
                total,
                comision,
                titularNombre,
                titularTipoID,
                titularDocumento,
                titularDireccion,
                terceroNombre,
                terceroTipoID,
                terceroDocumento,
                cuentaOrigen,
                cuentaDestino,
                referenciaPago,
                estadoPago,
                fechaPagoDia,
                fechaPagoMesHidden,
                fechaPagoAnio
            } = req.body;

            // Verificar que se han enviado los tres campos de fecha
            if (
                !fechaPagoDia || fechaPagoDia.trim() === '' ||
                !fechaPagoMesHidden || fechaPagoMesHidden.trim() === '' ||
                !fechaPagoAnio || fechaPagoAnio.trim() === ''
            ) {
                return res.status(400).json({
                    message: 'Debe ingresar día, mes y año para la fecha de operación.'
                });
            }

            const day = parseInt(fechaPagoDia, 10);
            const month = parseInt(fechaPagoMesHidden, 10);
            const year = parseInt(fechaPagoAnio, 10);

            if (isNaN(day) || isNaN(month) || isNaN(year)) {
                return res.status(400).json({
                    message: 'Valores de fecha de operación inválidos.'
                });
            }

            // Armar la fecha (recordar que en JS mes: 0 = enero, etc.)
            const finalDate = new Date(year, month - 1, day);
            console.log('Fecha de operación armada:', finalDate);

            // Procesar la imagen (si la hay)
            let receiptImagePath = null;
            if (req.file) {
                receiptImagePath = req.file.path;
                console.log('receiptImagePath:', receiptImagePath);
            }

            // Crear la operación; el campo hidden se establece en true por defecto.
            const newOperation = new Operation({
                userId,
                canal,
                plataforma,
                ordenNum: ordenNum ? parseInt(ordenNum) : null,
                tipoActivo,
                activo,
                moneda,
                monto: monto ? parseFloat(monto) : null,
                cantidad: cantidad ? parseFloat(cantidad) : null,
                total: total ? parseFloat(total) : null,
                comision: comision ? parseFloat(comision) : null,
                titularNombre,
                titularTipoID,
                titularDocumento,
                titularDireccion,
                terceroNombre,
                terceroTipoID,
                terceroDocumento,
                cuentaOrigen,
                cuentaDestino,
                referenciaPago,
                estadoPago,
                fecha: finalDate,
                receiptImage: receiptImagePath,
                hidden: true
            });

            await newOperation.save();
            return res.json({ message: 'Operación registrada correctamente' });
        } catch (error) {
            console.error('Error en POST /api/operation/register:', error);
            return res.status(500).json({ message: 'Error al registrar la operación' });
        }
    }
);

module.exports = router;
