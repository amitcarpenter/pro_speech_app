import { Router } from 'express';
import {
    createTermsCondition,
    getAllTermsConditions,
    getTermsConditionById,
    updateTermsCondition,
    deleteTermsCondition
} from '../controllers/termsAndConditionsController';

import { authenticateUser } from '../middlewares/auth';

const router = Router();

router.post('/create', authenticateUser, createTermsCondition);
// router.get('/', authenticateUser, getAllTermsConditions);
router.get('/', authenticateUser, getTermsConditionById);
router.put('/', authenticateUser, updateTermsCondition);
router.delete('/:id', authenticateUser, deleteTermsCondition);

export default router;
