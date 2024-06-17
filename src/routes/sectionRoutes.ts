import { Router } from 'express';
import { createSection, getSections, updateSection, deleteSection, getSectionById } from '../controllers/sectionController';

import { uploadSectionImage } from "../services/uploadImage"
import { authenticateUser } from "../middlewares/auth";

const router = Router();

router.post('/', authenticateUser, uploadSectionImage, createSection);

router.get('/', authenticateUser, getSections);

router.get('/:id', authenticateUser, getSectionById);

router.put('/:id', authenticateUser, updateSection);

router.delete('/:id', authenticateUser, deleteSection);

export default router;
