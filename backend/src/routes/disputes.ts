import { Router } from 'express';
import { prisma } from '../index';
import { initiateDispute } from '../services/squads';

const router = Router();

// Initiate dispute
router.post('/:jobId/initiate', async (req, res) => {
  try {
    const { initiatorWallet } = req.body;
    
    const job = await prisma.job.findUnique({
      where: { id: req.params.jobId },
      include: { poster: true, worker: true }
    });
    
    if (!job || (job.status !== 'SUBMITTED' && job.status !== 'LOCKED')) {
      return res.status(400).json({ error: 'Cannot dispute this job' });
    }
    
    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        jobId: job.id,
        initiatedBy: initiatorWallet,
        status: 'OPEN',
      }
    });
    
    // Update job status
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'DISPUTED' }
    });
    
    // TODO: Select jurors and update Squads vault
    
    res.json({ dispute });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate dispute' });
  }
});

// Cast vote (commit phase)
router.post('/:disputeId/vote', async (req, res) => {
  try {
    const { jurorWallet, commitHash } = req.body;
    
    const juror = await prisma.user.findUnique({
      where: { walletAddress: jurorWallet }
    });
    
    if (!juror) {
      return res.status(404).json({ error: 'Juror not found' });
    }
    
    const vote = await prisma.jurorVote.create({
      data: {
        disputeId: req.params.disputeId,
        jobId: req.body.jobId,
        jurorId: juror.id,
        commitHash,
        stakeAmount: 10, // Minimum stake
      }
    });
    
    res.json({ vote });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

export default router;
