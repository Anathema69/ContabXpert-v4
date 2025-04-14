// backend/routes/user-history-operations.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Operation = require('../models/Operation');

// GET /api/history?userId=xxx
// Retorna el historial de operaciones del usuario cuyo id se pasa en la query.
// Si el usuario autenticado es admin, puede consultar el historial de cualquier usuario;
// si es usuario normal, solo se permite su propio historial.
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: 'Falta userId en la query' });
        }
        // Si el rol no es admin, se debe asegurar que el usuario consultante es el mismo del parámetro.
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ message: 'No autorizado' });
        }
        // Buscar operaciones para el userId especificado y que tengan hidden: false
        const operations = await Operation.find({
            userId: userId,
            hidden: false
        }).sort({ createdAt: -1 });

        return res.json(operations);
    } catch (error) {
        console.error('Error en GET /api/history:', error);
        res.status(500).json({ message: 'Error al obtener operaciones' });
    }
});

module.exports = router;
