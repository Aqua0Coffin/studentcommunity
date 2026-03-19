import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Get timetable for a student's batch and department
router.get('/', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.role !== 'STUDENT') {
      return res.status(403).json({ message: 'Only students can view general timetable via this endpoint' });
    }

    const timetable = await prisma.timetable.findMany({
      where: {
        departmentId: user.departmentId || '',
        batchYear: user.batchYear || 0,
      },
      include: {
        faculty: { select: { firstName: true, lastName: true } }
      },
      orderBy: [ { dayOfWeek: 'asc' }, { periodNumber: 'asc' } ]
    });

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

export default router;
