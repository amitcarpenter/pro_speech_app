import express from 'express';
import {
  createModule,
  getAllModules,
  updateModuleById,
  deleteModuleById,
  getModuleBySectionId,
} from '../controllers/moduleController';

import { uploadModuleImage } from "../services/uploadImage"
import { authenticateUser,isAdmin } from "../middlewares/auth";


const router = express.Router();

//==================================== Routes for User ==============================

router.get('/', authenticateUser, authenticateUser, getAllModules);
router.get('/section-id/:id', authenticateUser, getModuleBySectionId);

//==================================== Routes for Admin ==============================
router.post('/', authenticateUser,isAdmin, uploadModuleImage, createModule);
router.put('/:id', authenticateUser,isAdmin, updateModuleById);
router.delete('/:id', authenticateUser,isAdmin, deleteModuleById);

export default router;
