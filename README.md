# HouseHand

HouseHand is a modern platform connecting households with trusted helpers in Rwanda. The platform facilitates task management, bidding, and secure payments for domestic services.

## Features

- **Task Management**: Clients can post tasks with detailed descriptions, budgets, and requirements
- **Helper Marketplace**: Skilled helpers can browse and bid on available tasks
- **Secure Bidding System**: Transparent bidding process with proposed prices and helper qualifications
- **User Profiles**: Detailed profiles for both clients and helpers with ratings and reviews
- **Multi-language Support**: Available in English, French, and Kinyarwanda
- **Secure Payments**: Built-in payment processing with helper earnings tracking
- **Real-time Notifications**: Stay updated on bids, task status changes, and messages

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (via Supabase)

### Installation

```sh
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd househand

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

The application uses Supabase for database and authentication. Make sure you have the following environment variables set up:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: React Query
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Internationalization**: i18next

## Development Tools

### SQL Scripts (`scripts/sql/`)

- `check_data.sql`: Verify task and helper data integrity
- `delete_tasks.sql`: Safely remove tasks with all related data

### TypeScript Scripts (`scripts/ts/`)

- `check_helpers.ts`: Verify helper profiles and activity
- `check_task_details.ts`: Validate task data and relationships

To run these scripts:

```bash
# SQL Scripts
psql -f scripts/sql/check_data.sql

# TypeScript Scripts
npx tsx scripts/ts/check_helpers.ts
npx tsx scripts/ts/check_task_details.ts
```

## Database Schema

Key tables in the system:
- `profiles`: User profiles for both clients and helpers
- `tasks`: Task listings with details and status
- `bids`: Helper bids on tasks
- `helper_reviews`: Client reviews of helpers
- `helper_earnings`: Track helper payments and withdrawals

## Security

- Row Level Security (RLS) enabled on all tables
- Secure authentication via Supabase
- Protected API endpoints
- Secure payment processing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
