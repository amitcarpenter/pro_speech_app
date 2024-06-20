import { Router } from 'express';
import {
    createTermsCondition,
    getTermsCondition,
    updateTermsCondition,
    deleteTermsCondition
} from '../controllers/termsAndConditionsController';

import { authenticateUser, isAdmin } from '../middlewares/auth';

const router = Router();

//==================================== Routes for User ==============================
router.get('/', authenticateUser, getTermsCondition);

//==================================== Routes for User ==============================
router.post('/create', authenticateUser, isAdmin, createTermsCondition);
router.put('/', authenticateUser, isAdmin, updateTermsCondition);
router.delete('/:id', authenticateUser, isAdmin, deleteTermsCondition);


export default router;
