import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TaskPaymentDialog } from '../components/client/TaskPaymentDialog';

describe('TaskPaymentDialog', () => {
  it('renders nothing if no task is provided', () => {
    const { container } = render(
      <TaskPaymentDialog task={null} isOpen={false} onClose={() => {}} onPaymentComplete={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });
}); 