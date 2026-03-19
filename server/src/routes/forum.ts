import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Get all posts
router.get('/', authenticate, async (req, res) => {
  try {
    const posts = await prisma.forumPost.findMany({
      include: { author: { select: { firstName: true, lastName: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// Create post
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { title, contentMd, category } = req.body;
    
    const post = await prisma.forumPost.create({
      data: {
        authorId: req.user.id,
        title,
        contentMd,
        category: category || 'GENERAL'
      }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// Add comment
router.post('/:id/comments', authenticate, async (req: any, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    const comment = await prisma.forumComment.create({
      data: {
        postId: id,
        authorId: req.user.id,
        content
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

export default router;
