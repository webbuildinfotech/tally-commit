import express from 'express';
import {
    fetchAllEvents,
    fetchEventById,
    createNewEvent,
    modifyEvent,
    removeEvent,
} from '../controllers/eventController.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// router.get('/events',authorizeRoles(['user', 'admin']), fetchAllEvents);
router.get('/', fetchAllEvents);
router.get('/:id', fetchEventById);
router.post('/create',authorizeRoles(['admin','user']), createNewEvent);
router.put('/update/:id', authorizeRoles(['admin','user']),modifyEvent);
router.delete('/delete/:id', removeEvent);

// router.post('/events',authorizeRoles(['admin']), createNewEvent);
// router.put('/events/:id',authorizeRoles(['admin']), modifyEvent);
// router.delete('/events/:id',authorizeRoles(['admin']), removeEvent);


export default router;
