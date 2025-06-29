import express from 'express';
import {
  createTask,
  getTasks,
  getTask,
  submitBid,
  acceptBid,
  completeTask
} from '../controllers/taskController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Routes accessible by both clients and helpers
router.get('/', getTasks);
router.get('/:id', getTask);

// Routes only for clients
router.post('/', restrictTo('client'), createTask);
router.patch('/:taskId/accept-bid/:bidId', restrictTo('client'), acceptBid);
router.patch('/:taskId/complete', restrictTo('client'), completeTask);

// Routes only for helpers
router.post('/:taskId/bid', restrictTo('helper'), submitBid);

export default router; 