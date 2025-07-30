import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { getPublishCreation, getUserCreations, togglePublishCreation } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.get('/get-user-creations', auth, getUserCreations);
userRouter.get('/get-published-creation', auth, getPublishCreation);
userRouter.post('/toggle-like-creation', auth, togglePublishCreation);

// Export the router to be used in the server
export default userRouter;