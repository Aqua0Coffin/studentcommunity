import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Apply for leave (Students only)
router.post('/', authenticate, authorize(['STUDENT']), async (req: any, res) => {
  try {
    const { startDate, endDate, reason, documentUrl } = req.body;
    
    const leave = await prisma.leaveRequest.create({
      data: {
        studentId: req.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        documentUrl
      }
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// View leaves (Students see theirs, Faculty/Admin see all in their department)
router.get('/', authenticate, async (req: any, res) => {
  try {
    if (req.user.role === 'STUDENT') {
      const leaves = await prisma.leaveRequest.findMany({
        where: { studentId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(leaves);
    } else {
      // Faculty Admin sees pending leaves
      const leaves = await prisma.leaveRequest.findMany({
        where: { status: 'PENDING' },
        include: { student: { select: { firstName: true, lastName: true, departmentId: true, batchYear: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(leaves);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// Approve/Reject leaves (Faculty/Admin only)
router.patch('/:id/status', authenticate, authorize(['FACULTY', 'ADMIN']), async (req: any, res) => {
  try {
    const { status } = req.body; // 'APPROVED' or 'REJECTED'
    const { id } = req.params;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        reviewedById: req.user.id
      }
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

export default router;
