/**
 * Settings Routes
 * GET  /api/settings      → Public (landing page data)
 * PUT  /api/settings      → Admin only (update settings)
 */

const router = require('express').Router()
const { getSettings, updateSettings } = require('../controllers/settings.controller')
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware')

router.get('/', getSettings)
router.put('/', verifyToken, isAdmin, updateSettings)

module.exports = router
