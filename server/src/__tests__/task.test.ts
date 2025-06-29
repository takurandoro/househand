import request from 'supertest';
import { app } from '../index';
import { User, IUser } from '../models/User';
import { Task, ITask } from '../models/Task';
import jwt from 'jsonwebtoken';

describe('Task API', () => {
  let clientToken: string;
  let helperToken: string;
  let clientId: string;
  let helperId: string;

  beforeAll(async () => {
    // Create test users
    const client = (await User.create({
      email: 'client@example.com',
      password: 'password123',
      name: 'Test Client',
      role: 'client' as const
    })) as IUser;
    clientId = client._id.toString();
    clientToken = jwt.sign(
      { id: clientId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    const helper = (await User.create({
      email: 'helper@example.com',
      password: 'password123',
      name: 'Test Helper',
      role: 'helper' as const
    })) as IUser;
    helperId = helper._id.toString();
    helperToken = jwt.sign(
      { id: helperId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  beforeEach(async () => {
    await Task.deleteMany({});
  });

  describe('POST /api/tasks', () => {
    it('should create a new task for client', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        location: 'Test Location',
        effort: 'medium' as const,
        budget: '5000',
        date: '2024-03-20'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.task).toBeDefined();
      expect(response.body.data.task.title).toBe(taskData.title);
      expect(response.body.data.task.clientId.toString()).toBe(clientId);
    });

    it('should not allow helpers to create tasks', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        location: 'Test Location',
        effort: 'medium' as const,
        budget: '5000',
        date: '2024-03-20'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${helperToken}`)
        .send(taskData)
        .expect(403);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.create({
        title: 'Task 1',
        description: 'Description 1',
        location: 'Location 1',
        effort: 'low' as const,
        budget: '3000',
        date: '2024-03-21',
        clientId,
        clientName: 'Test Client',
        status: 'active' as const
      });

      await Task.create({
        title: 'Task 2',
        description: 'Description 2',
        location: 'Location 2',
        effort: 'high' as const,
        budget: '8000',
        date: '2024-03-22',
        clientId,
        clientName: 'Test Client',
        status: 'completed' as const
      });
    });

    it('should return all tasks for client', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.tasks).toHaveLength(2);
    });

    it('should return only active tasks for helper', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${helperToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].status).toBe('active');
    });
  });

  describe('POST /api/tasks/:taskId/bid', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = (await Task.create({
        title: 'Task for Bid',
        description: 'Description',
        location: 'Location',
        effort: 'medium' as const,
        budget: '5000',
        date: '2024-03-23',
        clientId,
        clientName: 'Test Client',
        status: 'active' as const
      })) as ITask;
      taskId = task._id.toString();
    });

    it('should allow helper to submit bid', async () => {
      const bidData = {
        price: '4500',
        timeframe: '3 days',
        message: 'I can help with this task'
      };

      const response = await request(app)
        .post(`/api/tasks/${taskId}/bid`)
        .set('Authorization', `Bearer ${helperToken}`)
        .send(bidData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.task.bids).toHaveLength(1);
      expect(response.body.data.task.bids[0].helperId.toString()).toBe(helperId);
    });

    it('should not allow client to submit bid', async () => {
      const bidData = {
        price: '4500',
        timeframe: '3 days',
        message: 'I can help with this task'
      };

      const response = await request(app)
        .post(`/api/tasks/${taskId}/bid`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(bidData)
        .expect(403);

      expect(response.body.status).toBe('fail');
    });
  });
}); 