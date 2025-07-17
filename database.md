# HouseHand Database Documentation

## Overview
This document provides a comprehensive explanation of the HouseHand database schema, including all tables, their relationships, data flow, and business logic.

## Table of Contents
1. [Profiles](#profiles)
2. [Tasks](#tasks)
3. [Bids](#bids)
4. [Payments](#payments)
5. [Helper Earnings](#helper-earnings)
6. [Helper Reviews](#helper-reviews)
7. [Notifications](#notifications)
8. [Transactions](#transactions)

## Profiles
The profiles table is the core user table that stores information about both clients and helpers.

### Schema
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  phone_number text NOT NULL UNIQUE,
  user_type USER-DEFINED NOT NULL,
  email text NOT NULL UNIQUE,
  location text NOT NULL,
  bio text,
  avatar_url text NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
```

### Columns Explained 
- `id`: Unique identifier for the profile (UUID)
- `full_name`: User's full name
- `phone_number`: Unique phone number for contact
- `user_type`: Type of user (enum: likely 'client' or 'helper')
- `email`: Unique email address
- `location`: User's location
- `bio`: Optional biography/description
- `avatar_url`: URL to user's profile picture (geenrated automatically)
- `created_at`: Timestamp when profile was created
- `updated_at`: Timestamp when profile was last updated

### Data Flow
1. **Creation**: New row added when:
   - User signs up through authentication system
   - Profile information is completed during onboarding

2. **Updates**: `updated_at` changes when:
   - User edits their profile information
   - Profile picture is updated
   - Location is changed

## Tasks
The tasks table represents jobs/tasks that clients post for helpers to bid on.

### Schema
```sql
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  effort_level USER-DEFINED NOT NULL,
  min_price integer NOT NULL CHECK (min_price > 0),
  max_price integer NOT NULL,
  median_budget integer DEFAULT ((min_price + max_price) / 2),
  status USER-DEFINED NOT NULL DEFAULT 'open'::task_status,
  selected_helper_id uuid,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  hours text,
  budget_min integer,
  budget_max integer,
  payment_status boolean NOT NULL DEFAULT false,
  category USER-DEFINED NOT NULL DEFAULT 'other'::task_category,
  payment_amount integer,
  payment_date timestamp with time zone,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_selected_helper_id_fkey FOREIGN KEY (selected_helper_id) REFERENCES public.profiles(id),
  CONSTRAINT tasks_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id)
);
```

### Columns Explained
- `id`: Unique identifier for the task
- `client_id`: Reference to the client who created the task
- `title`: Task title
- `description`: Detailed task description
- `location`: Where the task needs to be performed
- `effort_level`: Estimated effort required (enum)
- `min_price`, `max_price`: Price range for the task
- `median_budget`: Automatically calculated average budget
- `status`: Current task status (enum: open, in_progress, completed, etc.)
- `selected_helper_id`: Reference to the chosen helper (nullable)
- `hours`: Expected time to complete
- `category`: Task category (enum)
- `payment_status`: Whether payment has been made
- `payment_amount`: Final agreed amount
- `payment_date`: When payment was processed

### Data Flow
1. **Creation**: New row added when:
   - Client creates a new task through the platform
   - System generates UUID and sets default status to 'open'

2. **Updates**: Various columns update throughout the task lifecycle:
   - `status` changes when:
     * Helper is selected (`open` → `assigned`)
     * Work begins (`assigned` → `in_progress`)
     * Task is completed (`in_progress` → `completed`)
   - `selected_helper_id` set when client chooses a helper
   - `payment_status` and `payment_amount` set when payment is processed
   - `updated_at` changes with any modification

## Bids
The bids table tracks helper applications for tasks.

### Schema
```sql
CREATE TABLE public.bids (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL,
  helper_id uuid NOT NULL,
  message text,
  proposed_price integer NOT NULL CHECK (proposed_price > 0),
  status USER-DEFINED NOT NULL DEFAULT 'submitted'::application_status,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  accepted_at timestamp with time zone,
  rejected_at timestamp with time zone,
  CONSTRAINT bids_pkey PRIMARY KEY (id),
  CONSTRAINT task_applications_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT bids_helper_id_fkey FOREIGN KEY (helper_id) REFERENCES public.profiles(id)
);
```

### Columns Explained
- `id`: Unique identifier for the bid
- `task_id`: Reference to the task being bid on
- `helper_id`: Reference to the helper making the bid
- `message`: Optional message from helper to client
- `proposed_price`: Helper's price proposal
- `status`: Bid status (submitted, accepted, rejected)
- `created_at`: When bid was created
- `accepted_at`: When bid was accepted (if applicable)
- `rejected_at`: When bid was rejected (if applicable)

### Data Flow
1. **Creation**: New row added when:
   - Helper submits a bid on an open task
   - System sets default status to 'submitted'

2. **Updates**: Status and timestamps change when:
   - Client accepts bid:
     * `status` → 'accepted'
     * `accepted_at` set to current time
   - Client rejects bid:
     * `status` → 'rejected'
     * `rejected_at` set to current time

## Payments
The payments table tracks financial transactions for completed tasks.

### Schema
```sql
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL UNIQUE,
  client_id uuid NOT NULL,
  helper_id uuid NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  social_security_contribution integer DEFAULT ((amount)::numeric * 0.05),
  paid boolean NOT NULL DEFAULT false,
  transaction_reference text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  paid_at timestamp with time zone,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_helper_id_fkey FOREIGN KEY (helper_id) REFERENCES public.profiles(id),
  CONSTRAINT payments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id)
);
```

### Columns Explained
- `id`: Unique identifier for the payment
- `task_id`: Reference to the associated task
- `client_id`: Reference to the paying client
- `helper_id`: Reference to the helper being paid
- `amount`: Payment amount
- `social_security_contribution`: Automatically calculated (5% of amount)
- `paid`: Payment status
- `transaction_reference`: External payment reference
- `created_at`: When payment record was created
- `paid_at`: When payment was completed

### Data Flow
1. **Creation**: New row added when:
   - Task is marked as completed
   - Payment amount is agreed upon

2. **Updates**: Status changes when:
   - Payment is processed:
     * `paid` → true
     * `paid_at` set to current time
     * `transaction_reference` populated

## Helper Earnings
Tracks earnings for helpers from completed tasks.

### Schema
```sql
CREATE TABLE public.helper_earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  helper_id uuid NOT NULL,
  task_id uuid NOT NULL,
  amount integer NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT helper_earnings_pkey PRIMARY KEY (id),
  CONSTRAINT helper_earnings_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT helper_earnings_helper_id_fkey FOREIGN KEY (helper_id) REFERENCES auth.users(id)
);
```

### Columns Explained
- `id`: Unique identifier for the earning record
- `helper_id`: Reference to the helper
- `task_id`: Reference to the completed task
- `amount`: Earning amount
- `status`: Payment status (pending or paid)
- `created_at`: When earning record was created

### Data Flow
1. **Creation**: New row added when:
   - Task is marked as completed
   - Payment is initiated

2. **Updates**: Status changes when:
   - Payment is processed:
     * `status` → 'paid'

## Helper Reviews
Stores client reviews for helpers after task completion.

### Schema
```sql
CREATE TABLE public.helper_reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  helper_id uuid NOT NULL,
  client_id uuid NOT NULL,
  task_id uuid NOT NULL UNIQUE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT helper_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT helper_reviews_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT helper_reviews_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT helper_reviews_helper_id_fkey FOREIGN KEY (helper_id) REFERENCES public.profiles(id)
);
```

### Columns Explained
- `id`: Unique identifier for the review
- `helper_id`: Reference to the helper being reviewed
- `client_id`: Reference to the reviewing client
- `task_id`: Reference to the completed task
- `rating`: Numerical rating (1-5)
- `comment`: Optional review text
- `created_at`: When review was submitted

### Data Flow
1. **Creation**: New row added when:
   - Client submits review after task completion
   - Only one review per task (enforced by UNIQUE constraint)

2. **Updates**: Reviews are immutable after creation

## Notifications
System notifications for users.

### Schema
```sql
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

### Columns Explained
- `id`: Unique identifier for the notification
- `user_id`: Reference to the recipient user
- `type`: Notification type (enum)
- `title`: Notification title
- `message`: Notification content
- `related_id`: Optional reference to related entity
- `read`: Whether notification has been viewed
- `created_at`: When notification was created

### Data Flow
1. **Creation**: New row added when:
   - System events occur (bid received, task assigned, etc.)
   - Messages are sent between users
   - Status changes require user attention

2. **Updates**: Read status changes when:
   - User views notification:
     * `read` → true

## Transactions
Tracks financial transactions for helpers.

### Schema
```sql
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  helper_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  reference text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::transaction_status,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_helper_id_fkey FOREIGN KEY (helper_id) REFERENCES public.profiles(id)
);
```

### Columns Explained
- `id`: Unique identifier for the transaction
- `helper_id`: Reference to the helper
- `type`: Transaction type (enum)
- `amount`: Transaction amount
- `reference`: External transaction reference
- `status`: Transaction status (enum)
- `created_at`: When transaction was created
- `updated_at`: When transaction was last updated

### Data Flow
1. **Creation**: New row added when:
   - Helper initiates withdrawal
   - System processes payment
   - Refund is issued

2. **Updates**: Status changes throughout transaction lifecycle:
   - Status progression:
     * `pending` → `processing` → `completed`/`failed`
   - `updated_at` changes with any modification
   - `reference` added when external processing begins

## Relationships and Constraints

### Foreign Key Relationships
1. Tasks:
   - `client_id` → profiles.id
   - `selected_helper_id` → profiles.id

2. Bids:
   - `task_id` → tasks.id
   - `helper_id` → profiles.id

3. Payments:
   - `task_id` → tasks.id
   - `client_id` → profiles.id
   - `helper_id` → profiles.id

4. Helper Earnings:
   - `task_id` → tasks.id
   - `helper_id` → auth.users.id

5. Helper Reviews:
   - `task_id` → tasks.id
   - `client_id` → profiles.id
   - `helper_id` → profiles.id

6. Notifications:
   - `user_id` → profiles.id

7. Transactions:
   - `helper_id` → profiles.id

### Unique Constraints
1. Profiles:
   - `phone_number`
   - `email`

2. Payments:
   - `task_id`

3. Helper Reviews:
   - `task_id`

### Check Constraints
1. Tasks:
   - `min_price > 0`
   - `max_price > min_price`

2. Bids:
   - `proposed_price > 0`

3. Payments:
   - `amount > 0`

4. Helper Reviews:
   - `rating` between 1 and 5

5. Transactions:
   - `amount > 0`

## Automated Calculations
1. Tasks:
   - `median_budget` = (min_price + max_price) / 2

2. Payments:
   - `social_security_contribution` = amount * 0.05

## Default Values
1. Tasks:
   - `status` = 'open'
   - `payment_status` = false
   - `category` = 'other'

2. Bids:
   - `status` = 'submitted'

3. Helper Earnings:
   - `status` = 'pending'

4. Notifications:
   - `read` = false

5. Transactions:
   - `status` = 'pending'

All timestamp fields (`created_at`, `updated_at`) default to `CURRENT_TIMESTAMP`. 