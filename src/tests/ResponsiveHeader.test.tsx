import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResponsiveHeader from '../components/ResponsiveHeader';

describe('ResponsiveHeader', () => {
  it('renders without crashing', () => {
    render(
      <ResponsiveHeader
        onFindWork={() => {}}
        onGetHelp={() => {}}
        onAbout={() => {}}
        onLogin={() => {}}
        onSignup={() => {}}
      />
    );
    expect(true).toBe(true); // Render smoke test
  });
}); 