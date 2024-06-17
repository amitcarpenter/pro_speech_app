import express from 'express';
import {
  createModule,
  getAllModules,
  getModuleById,
  updateModuleById,
  deleteModuleById,
  getModuleBySectionId,
} from '../controllers/moduleController';

import { uploadModuleImage } from "../services/uploadImage"
import { authenticateUser } from "../middlewares/auth";


const router = express.Router();

router.post('/', authenticateUser, uploadModuleImage, createModule);
router.get('/', authenticateUser, authenticateUser, getAllModules);
router.get('/:id', authenticateUser, getModuleById);

router.get('/section-id/:id', authenticateUser, getModuleBySectionId);

router.put('/:id', authenticateUser, updateModuleById);
router.delete('/:id', authenticateUser, deleteModuleById);

export default router;
