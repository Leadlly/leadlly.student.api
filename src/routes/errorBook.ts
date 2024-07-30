import express from 'express';
import { checkAuth } from '../middlewares/checkAuth';
import { getErrorBook } from '../controllers/ErrorBook/getErrorBook';
import { getChapterErrorBook } from '../controllers/ErrorBook/getChapterErrorBook';
import { createErrorNote } from '../controllers/ErrorBook/ErrorNotes/CreateErrorNotes';
import { toggleErrorNotes } from '../controllers/ErrorBook/ErrorNotes/toggleErrorNotes';

const router = express.Router();

router.get('/get', checkAuth, getErrorBook);
router.get('/chapter/:chapter', checkAuth, getChapterErrorBook);
router.post('/errorNote', checkAuth, createErrorNote);

router.put('/errorNote/toggle/:errorNote', checkAuth, toggleErrorNotes);
export default router;
