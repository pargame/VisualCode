import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App, { _clearAllNodesForTest } from '../src/App';

describe('Delete all nodes', () => {
  beforeEach(() => {
    // ensure storage is clean before each test
    try {
      _clearAllNodesForTest();
    } catch (e) {}
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('removes all nodes when confirmed', () => {
    const { container, getByText } = render(<App />);
    const board = container.querySelector('.board');
    if (!board) throw new Error('board element missing');

    board.getBoundingClientRect = () => ({ left: 0, top: 0, width: 480, height: 480 });

    // create a node on a grid intersection (48,48)
    fireEvent.click(board, { clientX: 48, clientY: 48 });
    let node = container.querySelector('.node');
    expect(node).toBeTruthy();

    // stub confirm to return true
    vi.stubGlobal('confirm', () => true);

    const delBtn = getByText('Delete all nodes');
    fireEvent.click(delBtn);

    // nodes should be removed from DOM
    node = container.querySelector('.node');
    expect(node).toBeNull();

    // localStorage should no longer have the key
    const stored = localStorage.getItem('visualcode_nodes_v1');
    expect(stored).toBeNull();
  });
});
