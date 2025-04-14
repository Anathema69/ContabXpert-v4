// backend/routes/user-panel.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// GET /api/user/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        // Permitir solo si el usuario logueado es el mismo o es admin
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'No autorizado' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
});

// PUT /api/user/update/:id
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        // Solo permite actualizar si es el propio usuario o admin
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'No autorizado' });
        }
        // Se esperan: fullName, telefono, docType, docNumber y direccion
        const { fullName, telefono, docType, docNumber, direccion } = req.body;
        const updatedData = { fullName, telefono, docType, docNumber, direccion, date_last_update: new Date() };

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Datos actualizados correctamente', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el usuario' });
    }
});

module.exports = router;
