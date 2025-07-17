import { render } from '@testing-library/react';
import { describe, it, beforeAll } from 'vitest';
import { Toaster } from '../components/providers/ToastProvider';

// Mock window.matchMedia for jsdom
beforeAll(() => {
  window.matchMedia = window.matchMedia || function(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() { return false; }
    };
  };
});

describe('Toaster', () => {
  it('renders without crashing', () => {
    render(<Toaster />);
  });
}); 