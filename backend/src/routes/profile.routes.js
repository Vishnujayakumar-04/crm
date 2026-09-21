import { Router } from 'express'
import { getProfile, updateProfile } from '../controllers/profileController.js'

const router = Router()

router.get('/:uid', getProfile)
router.put('/:uid', updateProfile)

export default router
