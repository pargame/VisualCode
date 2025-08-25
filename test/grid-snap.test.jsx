import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('Grid snap', () => {
  it('creates a node snapped to 24px grid when board is clicked', () => {
    const { container } = render(<App />);
    const board = container.querySelector('.board');
    if (!board) throw new Error('board element not found');

    // Mock bounding rect so clientX/clientY map predictably to board coords
    board.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 480,
      height: 480,
      right: 480,
      bottom: 480,
      x: 0,
      y: 0,
    });

    // Click at (48,48) which is exactly 24*2 so placement is allowed
    fireEvent.click(board, { clientX: 48, clientY: 48 });

    const node = container.querySelector('.node');
    expect(node).toBeTruthy();

    const left = parseInt(node.style.left || '0', 10);
    const top = parseInt(node.style.top || '0', 10);

    expect(left % 24).toBe(0);
    expect(top % 24).toBe(0);
  });
});
