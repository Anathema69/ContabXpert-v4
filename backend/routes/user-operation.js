// backend/routes/user-operation.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const Operation = require('../models/Operation');
const User = require('../models/User');

// Configuración de multer para subir imágenes (constancia)
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

// POST /api/operation/register -> Registro de nueva operación
router.post('/register', authMiddleware, upload.single('receiptImage'), async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

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
            cuentaDestino,
            referenciaPago,
            estadoPago,
            fechaPagoDia,
            fechaPagoMesHidden,
            fechaPagoAnio
        } = req.body;

        let receiptImagePath = null;
        if (req.file) {
            receiptImagePath = req.file.path;
        }

        // Construir la fecha a partir de los tres inputs
        let fecha;
        if (fechaPagoDia && fechaPagoMesHidden && fechaPagoAnio) {
            fecha = new Date(`${fechaPagoAnio}-${fechaPagoMesHidden.padStart(2, '0')}-${fechaPagoDia.padStart(2, '0')}`);
        } else {
            fecha = new Date();
        }

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
            cuentaDestino,
            referenciaPago,
            estadoPago,
            fecha,
            receiptImage: receiptImagePath,
            hidden: true // Valor por defecto para control de listado (borrado fantasma)
        });

        await newOperation.save();
        res.json({ message: 'Operación registrada correctamente' });
    } catch (error) {
        console.error('Error en POST /api/operation/register:', error);
        res.status(500).json({ message: 'Error al registrar la operación' });
    }
});

// GET /api/operation/:id -> Obtener detalles de una operación por ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const opId = req.params.id;
        const operation = await Operation.findById(opId);
        if (!operation) {
            return res.status(404).json({ message: 'Operación no encontrada' });
        }
        if (operation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }
        res.json(operation);
    } catch (error) {
        console.error('Error en GET /api/operation/:id:', error);
        res.status(500).json({ message: 'Error al obtener la operación' });
    }
});

// PUT /api/operation/edit/:id -> Actualizar una operación existente
router.put('/edit/:id', authMiddleware, upload.single('receiptImage'), async (req, res) => {
    try {
        const opId = req.params.id;
        const operation = await Operation.findById(opId);
        if (!operation) {
            return res.status(404).json({ message: 'Operación no encontrada' });
        }
        if (operation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }
        const {
            canal,
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
            cuentaDestino,
            referenciaPago,
            estadoPago,
            fechaPagoDia,
            fechaPagoMesHidden,
            fechaPagoAnio,
            cuentaOrigen,
            plataforma
        } = req.body;
        let receiptImagePath = operation.receiptImage;
        if (req.file) {
            receiptImagePath = req.file.path;
        }
        let fecha;
        if (fechaPagoDia && fechaPagoMesHidden && fechaPagoAnio) {
            fecha = new Date(`${fechaPagoAnio}-${fechaPagoMesHidden.padStart(2, '0')}-${fechaPagoDia.padStart(2, '0')}`);
        } else {
            fecha = operation.fecha;
        }
        const updatedData = {
            canal,
            // Aquí se actualiza el campo 'plataforma' (que en el frontend se muestra como Exchange)
            plataforma,
            ordenNum: ordenNum ? parseInt(ordenNum) : operation.ordenNum,
            tipoActivo,
            activo,
            moneda,
            monto: monto ? parseFloat(monto) : operation.monto,
            cantidad: cantidad ? parseFloat(cantidad) : operation.cantidad,
            total: total ? parseFloat(total) : operation.total,
            comision: comision ? parseFloat(comision) : operation.comision,
            titularNombre,
            titularTipoID,
            titularDocumento,
            titularDireccion,
            terceroNombre,
            terceroTipoID,
            terceroDocumento,
            cuentaDestino,
            referenciaPago,
            estadoPago,
            fecha,
            cuentaOrigen,
            receiptImage: receiptImagePath
        };
        const updatedOperation = await Operation.findByIdAndUpdate(opId, updatedData, { new: true });
        res.json({ message: 'Operación actualizada correctamente', operation: updatedOperation });
    } catch (error) {
        console.error('Error en PUT /api/operation/edit/:id:', error);
        res.status(500).json({ message: 'Error al actualizar la operación' });
    }
});

// Ruta para "eliminar" (soft delete) una operación: cambia hidden a true
router.put('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const opId = req.params.id;
        // Buscar la operación a eliminar
        const operation = await Operation.findById(opId);
        if (!operation) {
            return res.status(404).json({ message: 'Operación no encontrada' });
        }
        // Verificar permisos: solo el propio usuario o admin puede eliminar
        if (operation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }
        // Actualizar el campo hidden a true
        operation.hidden = true;
        await operation.save();
        res.json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar la operación:', error);
        res.status(500).json({ message: 'Error interno al eliminar el registro' });
    }
});



module.exports = router;
