import express from 'express';
import {
  createTask,
  getAllTasks,
  getTask,
  submitBid,
  acceptBid,
  completeTask
} from '../controllers/taskController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/')
  .get(getAllTasks)
  .post(restrictTo('client'), createTask);

router.route('/:taskId')
  .get(getTask);

router.route('/:taskId/bid')
  .post(restrictTo('helper'), submitBid);

router.route('/:taskId/bid/:bidId/accept')
  .patch(restrictTo('client'), acceptBid);

router.route('/:taskId/complete')
  .patch(restrictTo('client'), completeTask);

export default router; 