import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotificationBell from '../components/NotificationBell';
import { MemoryRouter } from 'react-router-dom';

describe('NotificationBell', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    );
    expect(true).toBe(true); // Render smoke test
  });
}); 