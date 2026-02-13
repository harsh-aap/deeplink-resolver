import { Router } from 'express';
import { resolveDeeplink, trackConversion } from '../deeplink/controller/deeplink.controller';

const router = Router();

router.get('/health', (req, res) => {
    res.send('Deeplink route working');
});

// Resolve deeplink
// GET /api/deeplink/d/:code
router.get('/d/:code', resolveDeeplink);

// Track conversion
// POST /api/deeplink/conversion
router.post('/conversion', trackConversion);

export default router;
