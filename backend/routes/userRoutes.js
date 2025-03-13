import express from 'express';
import { 
    updateUserDetails,
     getAllUsers, 
     removeUser, 
     getUserDetails } from '../controllers/userController.js';

const router = express.Router();

router.put('/update/:id', updateUserDetails);
router.get('/', getAllUsers);
router.delete('/delete/:id', removeUser);
router.get('/get/:id', getUserDetails);


export default router;