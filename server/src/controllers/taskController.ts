import { Request, Response, NextFunction } from 'express';
import { Task, ITask } from '../models/Task';
import { AppError } from '../middleware/errorHandler';

// Create a new task
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.create({
      ...req.body,
      clientId: req.user._id,
      clientName: req.user.name
    });

    res.status(201).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

// Get all tasks (with filters)
export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.user.role === 'helper' ? { status: 'active' } : {};
    const tasks = await Task.find(query);

    res.status(200).json({
      status: 'success',
      data: { tasks }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single task
export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

// Submit a bid
export const submitBid = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (task.status !== 'active') {
      return next(new AppError('Task is not accepting bids', 400));
    }

    const existingBid = task.bids.find(
      bid => bid.helperId.toString() === req.user._id.toString()
    );
    if (existingBid) {
      return next(new AppError('You have already submitted a bid', 400));
    }

    task.bids.push({
      helperId: req.user._id,
      helperName: req.user.name,
      price: req.body.price,
      timeframe: req.body.timeframe,
      message: req.body.message,
      status: 'pending',
      createdAt: new Date()
    });

    await task.save();

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

// Accept a bid
export const acceptBid = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (task.clientId.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to accept bids for this task', 403));
    }

    const bid = task.bids.find(b => b._id?.toString() === req.params.bidId);
    if (!bid) {
      return next(new AppError('Bid not found', 404));
    }

    if (task.status !== 'active') {
      return next(new AppError('Task is not in active status', 400));
    }

    // Update bid status
    bid.status = 'accepted';
    task.status = 'in-progress';
    task.selectedBidId = bid._id?.toString();

    // Update other bids to rejected
    task.bids.forEach(b => {
      if (b._id?.toString() !== req.params.bidId) {
        b.status = 'rejected';
      }
    });

    await task.save();

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

// Mark task as completed
export const completeTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (task.clientId.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to complete this task', 403));
    }

    if (task.status !== 'in-progress') {
      return next(new AppError('Task is not in progress', 400));
    }

    task.status = 'completed';
    await task.save();

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
}; 