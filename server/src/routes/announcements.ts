import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Get all announcements
router.get('/', authenticate, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [ { isPinned: 'desc' }, { createdAt: 'desc' } ],
      include: { author: { select: { firstName: true, lastName: true } } }
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// Create announcement (Admin only)
router.post('/', authenticate, authorize(['ADMIN']), async (req: any, res) => {
  try {
    const { title, content, targetAudience, isPinned } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        authorId: req.user.id,
        title,
        content,
        targetAudience: targetAudience || 'ALL',
        isPinned: isPinned || false
      }
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

export default router;
