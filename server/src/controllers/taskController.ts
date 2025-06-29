import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { AppError } from '../middleware/errorHandler';

// Create a new task
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskData = {
      ...req.body,
      clientId: req.user._id,
      clientName: req.user.name
    };

    const task = await Task.create(taskData);

    res.status(201).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

// Get all tasks (with filters)
export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters: any = { ...req.query };
    
    // If helper is searching, only show active tasks
    if (req.user.role === 'helper') {
      filters.status = 'active';
    }
    
    // If client is viewing their tasks, filter by clientId
    if (req.user.role === 'client') {
      filters.clientId = req.user._id;
    }

    const tasks = await Task.find(filters).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: tasks.length,
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
) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
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
) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    if (task.status !== 'active') {
      throw new AppError('This task is no longer accepting bids', 400);
    }

    const bid = {
      ...req.body,
      helperId: req.user._id,
      helperName: req.user.name,
      status: 'pending'
    };

    task.bids.push(bid);
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
) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    if (task.clientId.toString() !== req.user._id.toString()) {
      throw new AppError('You are not authorized to accept bids for this task', 403);
    }

    const bid = task.bids.id(req.params.bidId);
    if (!bid) {
      throw new AppError('No bid found with that ID', 404);
    }

    // Update bid statuses
    task.bids.forEach(b => {
      b.status = b._id.toString() === req.params.bidId ? 'accepted' : 'rejected';
    });

    task.status = 'in-progress';
    task.selectedBidId = req.params.bidId;
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
) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      throw new AppError('No task found with that ID', 404);
    }

    if (task.clientId.toString() !== req.user._id.toString()) {
      throw new AppError('You are not authorized to complete this task', 403);
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