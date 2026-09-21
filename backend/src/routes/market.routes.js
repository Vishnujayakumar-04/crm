import { Router } from 'express'
import { getQuote } from '../controllers/marketController.js'

const router = Router()

router.get('/quote/:symbol', getQuote)

export default router
