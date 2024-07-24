import express from 'express';
import { checkAuth } from '../middlewares/checkAuth';
import { getErrorBook } from '../controllers/ErrorBook/getErrorBook';
import { getChapterErrorBook } from '../controllers/ErrorBook/getChapterErrorBook';
import { createErrorNote } from '../controllers/ErrorBook/ErrorNotes/CreateErrorNotes';
import { getCompletedErrorNotes } from '../controllers/ErrorBook/ErrorNotes/getCompletedErrorNotes';
import { getUnCompletedErrorNotes } from '../controllers/ErrorBook/ErrorNotes/getUncompletedErrorNotes';
import { toggleErrorNotes } from '../controllers/ErrorBook/ErrorNotes/toggleErrorNotes';

const router = express.Router();

router.get('/get', getErrorBook);
router.get('/chapter', getChapterErrorBook);
router.post('/errorNote', createErrorNote);
router.get('/errorNote/completed', getCompletedErrorNotes);
router.get('/errorNote/unCompleted', getUnCompletedErrorNotes);

router.put('/errorNote/toggle/:errorNote', toggleErrorNotes);
export default router;
