import express from 'express';
import {
  createModule,
  getAllModules,
  getModuleById,
  updateModuleById,
  deleteModuleById
} from '../controllers/moduleController';

const router = express.Router();

router.post('/', createModule);
router.get('/', getAllModules);
router.get('/:id', getModuleById);
router.put('/:id', updateModuleById);
router.delete('/:id', deleteModuleById);

export default router;
