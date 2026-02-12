import { Router } from 'express';
import { healthCheck } from '../controllers/deeplink.controller';

const router = Router();

router.get('/health', healthCheck);

export default router;

