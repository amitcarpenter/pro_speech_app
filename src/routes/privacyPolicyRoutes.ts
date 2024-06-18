import express from 'express';
import {
    createPrivacyPolicy,
    getAllPrivacyPolicies,
    getPrivacyPolicyById,
    updatePrivacyPolicy,
    deletePrivacyPolicy,
} from '../controllers/privacyPolicyController';

import { authenticateUser } from '../middlewares/auth';


const router = express.Router();

// Define routes
router.post('/create', authenticateUser, createPrivacyPolicy);
router.get('/', authenticateUser, getAllPrivacyPolicies);
router.get('/:id', authenticateUser, getPrivacyPolicyById);
router.put('/:id', authenticateUser, updatePrivacyPolicy);
router.delete('/:id', authenticateUser, deletePrivacyPolicy);

export default router;
