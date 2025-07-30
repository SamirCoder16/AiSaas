import express from 'express';
import { generateArticle , generateBlogTitle, generateImages, removeBackground, removeImageObject, resumeReview} from '../controllers/ai.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { upload } from '../configs/multer.js';

const aiRouter = express.Router();

// Apply requireAuth middleware to the route
aiRouter.post('/generate-article', auth, generateArticle);
aiRouter.post('/generate-title', auth, generateBlogTitle);
aiRouter.post('/generate-image', auth, generateImages);
aiRouter.post('/remove-image-background', upload.single('image'), auth, removeBackground);
aiRouter.post('/remove-image-object', upload.single('image'), auth, removeImageObject);
aiRouter.post('/resume-review', upload.single('resume'), auth, resumeReview);


// Export the router to be used in the server
export default aiRouter;