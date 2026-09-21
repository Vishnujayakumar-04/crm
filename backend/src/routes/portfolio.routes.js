import { Router } from 'express'
import { getPortfolio, savePortfolio, getSummary } from '../controllers/portfolioController.js'

const router = Router()

router.get('/:uid', getPortfolio)
router.post('/:uid', savePortfolio)
router.get('/:uid/summary', getSummary)

export default router
