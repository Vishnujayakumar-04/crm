import { Router } from 'express'
import { exportBackup, importBackup } from '../controllers/backupController.js'

const router = Router()

router.get('/:uid/export', exportBackup)
router.post('/:uid/import', importBackup)

export default router
