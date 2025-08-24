import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import App from '../src/App';

describe('App', () => {
  it('renders title', () => {
    const { getByText } = render(<App />);
    expect(getByText(/pargame \/ VisualCode/i)).toBeTruthy();
  });
});
