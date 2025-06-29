import mongoose, { Document, Schema } from 'mongoose';

export interface IBid {
  _id?: mongoose.Types.ObjectId;
  helperId: mongoose.Types.ObjectId;
  helperName: string;
  price: string;
  timeframe: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  location: string;
  effort: string;
  budget: string;
  date: string;
  clientId: mongoose.Types.ObjectId;
  clientName: string;
  status: 'active' | 'in-progress' | 'completed' | 'cancelled';
  bids: mongoose.Types.DocumentArray<IBid>;
  selectedBidId?: string;
  createdAt: Date;
}

const bidSchema = new Schema<IBid>({
  helperId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  helperName: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  timeframe: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Task location is required'],
    trim: true
  },
  effort: {
    type: String,
    required: [true, 'Task effort level is required'],
    enum: ['low', 'medium', 'high']
  },
  budget: {
    type: String,
    required: [true, 'Task budget is required']
  },
  date: {
    type: String,
    required: [true, 'Task date is required']
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'in-progress', 'completed', 'cancelled'],
    default: 'active'
  },
  bids: [bidSchema],
  selectedBidId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
taskSchema.index({ location: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ clientId: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema); 