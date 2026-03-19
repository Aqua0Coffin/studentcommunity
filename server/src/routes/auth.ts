import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, enrollmentNumber } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role || 'STUDENT',
        profile: {
          create: {
            enrollmentNumber,
          }
        }
      },
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const validPass = await bcrypt.compare(password, user.passwordHash);
    if (!validPass) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

export default router;
