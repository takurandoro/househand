# HouseHand Project Structure

This document outlines the structure and purpose of each component in the HouseHand project.

## Core Types (`src/types/`)

### `common.ts`
Contains shared type definitions used across the application:
- `TaskCategory`: Enum for task categories (cleaning, gardening, etc.)
- `EffortLevel`: Task difficulty levels (easy, medium, hard)
- `PaginationParams`: Common pagination interface
- `ApiResponse`: Generic API response wrapper

### `task.ts`
Task-related type definitions:
- `Task`: Core task interface with properties like title, description, budget
- `TaskStatus`: Task lifecycle states (open, assigned, in_progress, etc.)
- `TaskWithRelations`: Extended task interface including related entities
- `TaskUpdateOptions`: Options for task status updates

### `bid.ts`
Bid-related type definitions:
- `Bid`: Core bid interface for task applications
- `BidStatus`: Bid states (submitted, accepted, rejected, withdrawn)
- `BidActionOptions`: Options for bid actions (submit, withdraw, etc.)

### `user.ts`
User-related type definitions:
- `Profile`: Base user profile interface
- `ClientProfile`: Client-specific profile properties
- `HelperProfile`: Helper-specific profile properties
- `UserSettings`: User preferences and settings

### `notification.ts`
Notification-related type definitions:
- `Notification`: Core notification interface
- `NotificationType`: Types of notifications
- `NotificationPreferences`: User notification settings

## API Layer (`src/api/`)

### `client.ts`
Supabase client configuration and base API utilities:
- Supabase instance initialization
- Environment variable validation
- Base authentication utilities

### `tasks.ts`
Task-related API functions:
- `loadTasksForView`: Fetches tasks based on view type and filters
- `updateTaskStatus`: Updates task status with proper validation
- `createTask`: Creates new tasks
- `getTaskById`: Fetches detailed task information

### `bids.ts`
Bid-related API functions:
- `handleBid`: Manages bid actions (submit, withdraw, accept, reject)
- `getBidsByTaskId`: Fetches bids for a specific task
- `getBidsByHelperId`: Fetches bids made by a helper

### `notifications.ts`
Notification-related API functions:
- `getNotifications`: Fetches user notifications
- `markNotificationAsRead`: Updates notification read status
- `createNotification`: Creates new notifications
- `subscribeToNotifications`: Real-time notification subscription

## State Management

### Contexts (`src/contexts/`)

#### `AuthContext.tsx`
Authentication context provider:
- User authentication state management
- Profile management
- Authentication methods (sign in, sign up, sign out)

#### `LanguageContext.tsx`
Internationalization context provider:
- Language state management
- Translation utilities
- Language switching functionality

### Hooks (`src/hooks/`)

#### Data Hooks (`src/hooks/data/`)

##### `useTasks.ts`
Task-related React Query hooks:
- `useTasks`: Fetches and manages task lists
- `useTask`: Manages single task data
- `useUpdateTaskStatus`: Task status updates
- `useCreateTask`: Task creation

##### `useBids.ts`
Bid-related React Query hooks:
- `useBidsByTask`: Manages bids for a task
- `useBidsByHelper`: Manages helper's bids
- `useHandleBid`: Bid actions management

##### `useNotifications.ts`
Notification-related React Query hooks:
- Notification fetching and management
- Real-time notification updates
- Notification status management

#### UI Hooks (`src/hooks/`)

##### `use-toast.ts`
Toast notification hook:
- Unified toast notification interface
- Toast state management

## Utilities (`src/utils/`)

### `formatting.ts`
Formatting utility functions:
- Currency formatting (RWF)
- Date formatting
- Phone number formatting
- Text truncation

### `validation.ts`
Form validation utilities:
- Task input validation
- Bid input validation
- User input validation (email, phone, password)

### `constants.ts`
Application constants:
- Task categories and statuses
- Route definitions
- API error messages
- Pagination settings

## Error Handling (`src/errors/`)

### `types.ts`
Custom error classes:
- `AppError`: Base application error
- `ValidationError`: Input validation errors
- `AuthenticationError`: Auth-related errors
- `NotFoundError`: Resource not found errors

### `handlers.ts`
Error handling utilities:
- `handleSupabaseError`: Database error handling
- `handleAuthError`: Authentication error handling
- `handleApiError`: Generic API error handling

## Internationalization (`src/i18n/`)

### `config.ts`
i18n configuration:
- Language setup
- Translation loading
- Fallback configuration

### Translations (`src/i18n/translations/`)
Translation files for supported languages:
- `en.json`: English translations
- `fr.json`: French translations
- `rw.json`: Kinyarwanda translations

Each translation file contains structured key-value pairs for:
- Common UI elements
- Authentication messages
- Task-related content
- Bid-related content
- Notifications
- Validation messages

## Project Organization Principles

1. **Modularity**: Each file has a single responsibility and clear purpose
2. **Type Safety**: Comprehensive TypeScript types for all entities
3. **Error Handling**: Structured error handling at all levels
4. **Internationalization**: Full multi-language support
5. **State Management**: Clear separation of concerns in state management
6. **API Organization**: Structured API layer with proper error handling
7. **Code Reusability**: Shared utilities and components
8. **Documentation**: Clear documentation of purpose and usage 