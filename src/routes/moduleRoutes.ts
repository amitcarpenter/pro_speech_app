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

router.post('/', uploadModuleImage, createModule);
router.get('/', authenticateUser, getAllModules);
router.get('/:id', getModuleById);

router.get('/section-id/:id', authenticateUser, getModuleBySectionId);

router.put('/:id', updateModuleById);
router.delete('/:id', deleteModuleById);

export default router;
