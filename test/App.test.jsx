import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import App from '../src/App';

describe('App', () => {
  it('renders title', () => {
    const { getByRole } = render(<App />);
    // Target the main heading (H1) to avoid matching incidental text like storage keys
    expect(getByRole('heading', { level: 1, name: /VisualCode/i })).toBeTruthy();
  });
});
