import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Get user by wallet
router.get('/:wallet', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: req.params.wallet },
      include: {
        postedJobs: {
          where: { status: 'COMPLETED' },
          select: { id: true, title: true, budget: true }
        },
        acceptedJobs: {
          where: { status: 'COMPLETED' },
          select: { id: true, title: true, budget: true }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create/update user
router.post('/', async (req, res) => {
  try {
    const { walletAddress, username, userType } = req.body;
    
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {
        ...(username && { username }),
        ...(userType && { userType }),
      },
      create: {
        walletAddress,
        username,
        userType: userType || 'HUMAN',
      }
    });
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
