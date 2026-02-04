import { Router } from 'express';
import { verifyJobProof } from '../services/verification';

const router = Router();

// Verify job proof
router.post('/:jobId', async (req, res) => {
  try {
    const result = await verifyJobProof(req.params.jobId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
