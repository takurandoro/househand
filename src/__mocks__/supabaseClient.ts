import { vi } from 'vitest';

export const supabase = {
  from: vi.fn(() => ({
    // Mock the 'bids' table
    bids: {
      select: vi.fn(() => {
        const result = {
          data: [
            { 
              id: 'bid-1', 
              task_id: 'task-1', 
              helper_id: 'helper-1', 
              message: 'I can do this task!', 
              proposed_price: 100, 
              status: 'submitted', 
              created_at: new Date(), 
              accepted_at: null, 
              rejected_at: null 
            }
          ],
          error: null,
        };
        return { ...result, single: vi.fn(() => ({ data: result.data[0], error: null })) };
      }),
      insert: vi.fn(() => ({
        data: [{ 
          id: 'bid-2', 
          task_id: 'task-2', 
          helper_id: 'helper-2', 
          message: 'I will help you!', 
          proposed_price: 150, 
          status: 'submitted', 
          created_at: new Date(), 
          accepted_at: null, 
          rejected_at: null 
        }],
        error: null
      })),
      update: vi.fn(() => ({
        data: [{ 
          id: 'bid-1', 
          status: 'accepted', 
          accepted_at: new Date(), 
          rejected_at: null 
        }],
        error: null
      })),
      delete: vi.fn(() => ({
        data: null,
        error: null
      }))
    },

    // Mock the 'helper_earnings' table
    helper_earnings: {
      select: vi.fn(() => {
        const result = {
          data: [
            { 
              id: 'earning-1', 
              helper_id: 'helper-1', 
              task_id: 'task-1', 
              amount: 100, 
              status: 'pending', 
              created_at: new Date(), 
              withdrawn_at: null 
            }
          ],
          error: null
        };
        return { ...result, single: vi.fn(() => ({ data: result.data[0], error: null })) };
      })
    },

    // Mock the 'helper_reviews' table
    helper_reviews: {
      select: vi.fn(() => {
        const result = {
          data: [
            { 
              id: 'review-1', 
              helper_id: 'helper-1', 
              client_id: 'client-1', 
              task_id: 'task-1', 
              rating: 5, 
              comment: 'Great job!', 
              created_at: new Date() 
            }
          ],
          error: null
        };
        return { ...result, single: vi.fn(() => ({ data: result.data[0], error: null })) };
      }),
      insert: vi.fn(() => ({
        data: [{ 
          id: 'review-2', 
          helper_id: 'helper-2', 
          client_id: 'client-2', 
          task_id: 'task-2', 
          rating: 4, 
          comment: 'Good service!', 
          created_at: new Date() 
        }],
        error: null
      }))
    },

    // Mock the 'helper_withdrawals' table
    helper_withdrawals: {
      select: vi.fn(() => {
        const result = {
          data: [
            { 
              id: 'withdrawal-1', 
              helper_id: 'helper-1', 
              amount: 100, 
              status: 'completed', 
              created_at: new Date(), 
              completed_at: new Date(), 
              notes: 'First withdrawal'
            }
          ],
          error: null
        };
        return { ...result, single: vi.fn(() => ({ data: result.data[0], error: null })) };
      })
    },

    // Mock the 'notifications' table
    notifications: {
      select: vi.fn(() => {
        const result = {
          data: [
            { 
              id: 'notification-1', 
              user_id: 'user-1', 
              type: 'task_update', 
              title: 'New task available', 
              message: 'Check out the latest tasks!', 
              related_id: 'task-1', 
              read: false, 
              created_at: new Date() 
            }
          ],
          error: null
        };
        return { ...result, single: vi.fn(() => ({ data: result.data[0], error: null })) };
      })
    },

    // Mock the 'payments' table
    payments: {
      select: vi.fn(() => {
        const result = {
          data: [
            { 
              id: 'payment-1', 
              task_id: 'task-1', 
              client_id: 'client-1', 
              helper_id: 'helper-1', 
              amount: 200, 
              social_security_contribution: 10, 
              paid: true, 
              transaction_reference: 'TX12345', 
              created_at: new Date(), 
              paid_at: new Date() 
            }
          ],
          error: null
        };
        return { ...result, single: vi.fn(() => ({ data: result.data[0], error: null })) };
      })
    },

    // Mock the 'profiles' table
    profiles: {
      select: vi.fn(() => {
        const result = {
          data: [
            { 
              id: 'helper-1', 
              full_name: 'John Doe', 
              phone_number: '1234567890', 
              user_type: 'helper', 
              email: 'helper@example.com', 
              location: 'City A', 
              bio: 'A skilled worker', 
              avatar_url: 'http://example.com/avatar.jpg', 
              created_at: new Date(), 
              updated_at: new Date() 
            }
          ],
          error: null
        };
        return { ...result, single: vi.fn(() => ({ data: result.data[0], error: null })) };
      }),
      insert: vi.fn(() => ({
        data: [{ 
          id: 'helper-2', 
          full_name: 'Jane Smith', 
          phone_number: '0987654321', 
          user_type: 'helper', 
          email: 'jane@example.com', 
          location: 'City B', 
          bio: 'An experienced helper', 
          avatar_url: 'http://example.com/avatar2.jpg', 
          created_at: new Date(), 
          updated_at: new Date() 
        }],
        error: null
      }))
    },

    // Mock the 'tasks' table
    tasks: {
      select: vi.fn(() => {
        const result = {
          data: [
            { 
              id: 'task-1', 
              client_id: 'client-1', 
              title: 'Cleaning Task', 
              description: 'Clean the office', 
              location: 'Office A', 
              min_price: 50, 
              max_price: 100, 
              median_budget: 75, 
              status: 'open', 
              selected_helper_id: 'helper-1', 
              created_at: new Date(), 
              updated_at: new Date() 
            }
          ],
          error: null
        };
        return { ...result, single: vi.fn(() => ({ data: result.data[0], error: null })) };
      }),
      insert: vi.fn(() => ({
        data: [{ 
          id: 'task-2', 
          client_id: 'client-2', 
          title: 'Delivery Task', 
          description: 'Deliver goods', 
          location: 'Warehouse A', 
          min_price: 100, 
          max_price: 150, 
          median_budget: 125, 
          status: 'open', 
          selected_helper_id: 'helper-2', 
          created_at: new Date(), 
          updated_at: new Date() 
        }],
        error: null
      }))
    },

    // Mock the 'transactions' table
    transactions: {
      select: vi.fn(() => {
        const result = {
          data: [
            { 
              id: 'transaction-1', 
              helper_id: 'helper-1', 
              type: 'withdrawal', 
              amount: 100, 
              reference: 'TX12345', 
              status: 'completed', 
              created_at: new Date(), 
              updated_at: new Date() 
            }
          ],
          error: null
        };
        return { ...result, single: vi.fn(() => ({ data: result.data[0], error: null })) };
      })
    }
  })),
};
