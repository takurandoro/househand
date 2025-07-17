import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../hooks/use-mobile';

describe('useIsMobile', () => {
  function setWindowWidth(width: number) {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  }

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

  it('returns true if window width is less than 768', () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false if window width is 768 or more', () => {
    setWindowWidth(900);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
}); 