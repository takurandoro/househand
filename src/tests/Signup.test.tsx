import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../pages/Signup';

describe('Signup Page', () => {
  it('renders the signup form', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+25078/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your location/i)).toBeInTheDocument();
  });
}); 