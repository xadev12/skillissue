import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../index';
import { createJobEscrow, releaseEscrow } from '../services/squads';
import { verifyJobProof } from '../services/verification';

const router = Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const { status, category, page = '1', limit = '20' } = req.query;
    
    const jobs = await prisma.job.findMany({
      where: {
        ...(status && { status: status as string }),
        ...(category && { category: category as string }),
      },
      include: {
        poster: {
          select: { walletAddress: true, reputationScore: true }
        },
        worker: {
          select: { walletAddress: true, reputationScore: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    });
    
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        poster: true,
        worker: true,
        dispute: true,
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create job
router.post('/', [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').trim().isLength({ min: 10 }),
  body('budget').isFloat({ min: 1 }),
  body('deadline').isISO8601(),
  body('posterWallet').isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { title, description, budget, deadline, category, proofType, posterWallet, location } = req.body;
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: posterWallet }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: posterWallet }
      });
    }
    
    // Create Squads vault for escrow
    const vaultAddress = await createJobEscrow({
      jobId: Date.now().toString(),
      posterWallet,
      budget,
    });
    
    // Create job
    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget,
        deadline: new Date(deadline),
        category: category || 'OTHER',
        proofType: proofType || 'MANUAL',
        posterId: user.id,
        squadsVaultAddress: vaultAddress,
        ...(location && {
          locationLat: location.lat,
          locationLng: location.lng,
          locationRadius: location.radius || 100,
        }),
      },
      include: {
        poster: {
          select: { walletAddress: true, reputationScore: true }
        }
      }
    });
    
    res.status(201).json({ job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Accept job
router.post('/:id/accept', async (req, res) => {
  try {
    const { workerWallet } = req.body;
    
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });
    
    if (!job || job.status !== 'OPEN') {
      return res.status(400).json({ error: 'Job not available' });
    }
    
    if (new Date() > job.deadline) {
      return res.status(400).json({ error: 'Job deadline passed' });
    }
    
    // Find or create worker
    let worker = await prisma.user.findUnique({
      where: { walletAddress: workerWallet }
    });
    
    if (!worker) {
      worker = await prisma.user.create({
        data: { walletAddress: workerWallet }
      });
    }
    
    // Update job
    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        status: 'LOCKED',
        workerId: worker.id,
      },
      include: {
        poster: { select: { walletAddress: true } },
        worker: { select: { walletAddress: true } },
      }
    });
    
    res.json({ job: updatedJob });
  } catch (error) {
    console.error('Accept job error:', error);
    res.status(500).json({ error: 'Failed to accept job' });
  }
});

// Submit work
router.post('/:id/submit', async (req, res) => {
  try {
    const { deliverableUrl, deliverableHash, proofData } = req.body;
    
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { worker: true }
    });
    
    if (!job || job.status !== 'LOCKED') {
      return res.status(400).json({ error: 'Job not in progress' });
    }
    
    // Update job with submission
    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        status: 'SUBMITTED',
        deliverableUrl,
        deliverableHash,
        proofData: proofData || {},
      }
    });
    
    // Auto-verify if proof type supports it
    if (job.proofType !== 'MANUAL') {
      verifyJobProof(job.id).catch(console.error);
    }
    
    res.json({ job: updatedJob });
  } catch (error) {
    console.error('Submit work error:', error);
    res.status(500).json({ error: 'Failed to submit work' });
  }
});

// Approve work and release payment
router.post('/:id/approve', async (req, res) => {
  try {
    const { posterWallet } = req.body;
    
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { poster: true, worker: true }
    });
    
    if (!job || job.status !== 'SUBMITTED') {
      return res.status(400).json({ error: 'Work not submitted' });
    }
    
    if (job.poster.walletAddress !== posterWallet) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Release escrow
    await releaseEscrow({
      vaultAddress: job.squadsVaultAddress!,
      workerWallet: job.worker!.walletAddress,
      amount: job.budget,
    });
    
    // Update job and user stats
    const [updatedJob] = await prisma.$transaction([
      prisma.job.update({
        where: { id: req.params.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        }
      }),
      prisma.user.update({
        where: { id: job.posterId },
        data: {
          jobsPosted: { increment: 1 },
          totalSpent: { increment: job.budget }
        }
      }),
      prisma.user.update({
        where: { id: job.workerId! },
        data: {
          jobsCompleted: { increment: 1 },
          totalEarned: { increment: job.budget * 0.95 }
        }
      })
    ]);
    
    res.json({ job: updatedJob });
  } catch (error) {
    console.error('Approve work error:', error);
    res.status(500).json({ error: 'Failed to approve work' });
  }
});

export default router;
