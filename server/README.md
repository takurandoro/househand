# HouseHand Backend

This is the backend server for the HouseHand application. It provides the API endpoints for user authentication, task management, and bidding functionality.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/househand
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

3. Make sure MongoDB is installed and running locally, or update the `MONGODB_URI` to point to your MongoDB instance.

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register a new user
- POST `/api/auth/login` - Login user

### Tasks
- GET `/api/tasks` - Get all tasks (filtered based on user role)
- GET `/api/tasks/:id` - Get a specific task
- POST `/api/tasks` - Create a new task (client only)
- DELETE `/api/tasks/:id` - Delete a task (client only)
- POST `/api/tasks/:taskId/bid` - Submit a bid for a task (helper only)
- PATCH `/api/tasks/:taskId/accept-bid/:bidId` - Accept a bid (client only)
- PATCH `/api/tasks/:taskId/complete` - Mark a task as completed (client only)

## Development

The server is built with:
- Node.js & Express
- TypeScript
- MongoDB & Mongoose
- JWT for authentication

To run both frontend and backend in development:
1. Start MongoDB
2. Navigate to the project root
3. Run `npm run dev` 