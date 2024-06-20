import { Router } from 'express';
import { createSection, getSections, updateSection, deleteSection } from '../controllers/sectionController';

import { uploadSectionImage } from "../services/uploadImage"
import { authenticateUser, isAdmin } from "../middlewares/auth";

const router = Router();

//=================================== Routes for User ==============================
router.get('/', authenticateUser, getSections);
router.put('/:id', authenticateUser, isAdmin, updateSection);


//==================================== Routes for ADMIN ==============================
router.post('/', authenticateUser, isAdmin, uploadSectionImage, createSection);
router.delete('/:id', authenticateUser, isAdmin, deleteSection);

export default router;
