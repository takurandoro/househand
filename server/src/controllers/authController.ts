import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const signToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  const options: SignOptions = { expiresIn: '1h' };
  return jwt.sign({ id: userId }, secret as Secret, options);
};

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken(user._id.toString());

  // Remove password from output
  const userObject = user.toObject();
  delete userObject.password;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userObject
    }
  });
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    });

    createSendToken(user, 201, res);
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Email already in use', 400));
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
}; 