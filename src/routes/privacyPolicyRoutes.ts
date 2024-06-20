import express from 'express';
import {
    createPrivacyPolicy,
    getAllPrivacyPolicies,
    updatePrivacyPolicy,
    deletePrivacyPolicy,
} from '../controllers/privacyPolicyController';
import { authenticateUser, isAdmin } from '../middlewares/auth';


const router = express.Router();

//==================================== Routes for User ==============================
router.get('/', authenticateUser, getAllPrivacyPolicies);


//==================================== Routes for ADMIN ==============================
router.post('/create', authenticateUser, isAdmin, createPrivacyPolicy);
router.put('/', authenticateUser, isAdmin, updatePrivacyPolicy);
router.delete('/:id', authenticateUser, isAdmin, deletePrivacyPolicy);

export default router;
