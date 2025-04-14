/************************************************
 * routes/user-panel.js
 ************************************************/
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// GET /api/user/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
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
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Esperamos fullName, telefono, accountNumber y los campos para la fecha de nacimiento
        const { fullName, telefono, accountNumber, birthDia, birthMesHidden, birthAnio } = req.body;
        const updateData = { fullName, telefono, accountNumber };

        // Si se han enviado los tres campos y no están vacíos, se arma la fecha
        if (
            birthDia && birthDia.trim() !== '' &&
            birthMesHidden && birthMesHidden.trim() !== '' &&
            birthAnio && birthAnio.trim() !== ''
        ) {
            const d = parseInt(birthDia, 10);
            const m = parseInt(birthMesHidden, 10);
            const y = parseInt(birthAnio, 10);
            if (isNaN(d) || isNaN(m) || isNaN(y)) {
                return res.status(400).json({ message: 'Valores de fecha de nacimiento inválidos.' });
            }
            updateData.birthDate = new Date(y, m - 1, d);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Datos actualizados', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar' });
    }
});

module.exports = router;
