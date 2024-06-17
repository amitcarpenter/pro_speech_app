import { Router } from 'express';
import { createSection, getSections, updateSection, deleteSection, getSectionById } from '../controllers/sectionController';

const router = Router();

router.post('/', createSection);
router.get('/', getSections);
router.get('/:id', getSectionById);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

export default router;
