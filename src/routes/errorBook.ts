import express from 'express';
import { checkAuth } from '../middlewares/checkAuth';
import { getErrorBook } from '../controllers/ErrorBook/getErrorBook';
import { getChapterErrorBook } from '../controllers/ErrorBook/getChapterErrorBook';
import { createErrorNote } from '../controllers/ErrorBook/ErrorNotes/CreateErrorNotes';
import { toggleErrorNotes } from '../controllers/ErrorBook/ErrorNotes/toggleErrorNotes';
import { updateErrorBook } from '../controllers/ErrorBook/updateErrorBook';
import { authorizeSubscriber } from '../middlewares/checkCategory';

const router = express.Router();

router.use(checkAuth, authorizeSubscriber());

router.get('/get', getErrorBook);
router.get('/chapter/:chapter', getChapterErrorBook);
router.post('/errorNote', createErrorNote);
router.put('/errorNote/toggle/:errorNote', toggleErrorNotes);
router.put('/update', updateErrorBook);
export default router;
