import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

// Get logged in user profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Omit password hash
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

export default router;
