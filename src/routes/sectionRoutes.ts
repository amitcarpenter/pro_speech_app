import { Router } from 'express';
import { createSection, getSections, updateSection, deleteSection, getSectionById } from '../controllers/sectionController';

import { uploadSectionImage } from "../services/uploadImage"
import { authenticateUser } from "../middlewares/auth";

const router = Router();

router.post('/', uploadSectionImage, createSection);
router.get('/', authenticateUser, getSections);
router.get('/:id', getSectionById);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

export default router;
