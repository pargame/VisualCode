import React, { useEffect, useRef, useState } from 'react';
import { GRID, SNAP_TOLERANCE } from './constants';
const STORAGE_KEY = 'visualcode_nodes_v1';

function loadNodes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveNodes(nodes) {
  try {
    if (!nodes || nodes.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    }
  } catch (e) {
    // ignore storage errors in environments like tests
  }
}

export function _clearAllNodesForTest() {
  // helper used by tests to clear persisted storage and in-memory nodes
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}

export default function App() {
  const [nodes, setNodes] = useState(() => loadNodes());
  const [selectedId, setSelectedId] = useState(null);
  const [codeDraft, setCodeDraft] = useState('');
  const [hoverPos, setHoverPos] = useState(null);
  const boardRef = useRef(null);

  useEffect(() => {
    saveNodes(nodes);
  }, [nodes]);

  useEffect(() => {
    const s = nodes.find((n) => n.id === selectedId);
    setCodeDraft(s ? s.code || '' : '');
  }, [selectedId]);

  function handleBoardClick(e) {
    // create a node at the clicked position on the board
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    // include scroll offsets so coordinates map to board content (not just viewport)
    const scrollLeft = boardRef.current.scrollLeft || 0;
    const scrollTop = boardRef.current.scrollTop || 0;
    const x = e.clientX - rect.left + scrollLeft;
    const y = e.clientY - rect.top + scrollTop;
    // only allow placement when click is (practically) on a grid intersection
    if (!isAtGridIntersection(x, y)) return;

    const { sx: snapX, sy: snapY } = snapToDiagGrid(x, y);

    const id = Date.now();
    const newNode = { id, x: snapX, y: snapY, code: '# python\n' };
    setNodes((s) => [...s, newNode]);
    setSelectedId(id);
  }

  function handleBoardMouseMove(e) {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const scrollLeft = boardRef.current.scrollLeft || 0;
    const scrollTop = boardRef.current.scrollTop || 0;
    const x = e.clientX - rect.left + scrollLeft;
    const y = e.clientY - rect.top + scrollTop;
    // only show hover preview when pointer is on an intersection
    if (!isAtGridIntersection(x, y)) {
      setHoverPos(null);
      return;
    }
    const { sx, sy } = snapToDiagGrid(x, y);
    setHoverPos({ x: sx, y: sy });
  }

  function handleBoardMouseLeave() {
    setHoverPos(null);
  }

  // allow creating nodes by clicking anywhere (outside interactive controls)
  useEffect(() => {
    function onAnyClick(e) {
      // ignore clicks that originate from interactive controls, nodes/editor, or the board itself
      if (!boardRef.current) return;
      // normalize target to an Element in case the event target is a text node or other non-element
      let el = e.target;
      try {
        // climb from non-element nodes to their nearest parent element
        while (el && el.nodeType !== 1) el = el.parentElement;
      } catch (err) {
        el = null;
      }

      const isInteractive = !!(
        el &&
        (el.closest('.editor') ||
          el.closest('button') ||
          el.closest('textarea') ||
          el.closest('input') ||
          el.closest('.node') ||
          el.closest('.board'))
      );

      if (isInteractive) return;

      // compute coordinates relative to the board content so clicks anywhere map to the
      // board correctly even when the board has been scrolled.
      const rect = boardRef.current.getBoundingClientRect();
      const scrollLeft = boardRef.current.scrollLeft || 0;
      const scrollTop = boardRef.current.scrollTop || 0;
      let x = e.clientX - rect.left + scrollLeft;
      let y = e.clientY - rect.top + scrollTop;
      // clamp to viewport bounds
      x = Math.max(0, Math.min(x, rect.width + scrollLeft));
      y = Math.max(0, Math.min(y, rect.height + scrollTop));

      // only allow placement when the click is on a grid intersection
      if (!isAtGridIntersection(x, y)) return;

      const { sx: snapX, sy: snapY } = snapToDiagGrid(x, y);

      const id = Date.now();
      const newNode = { id, x: snapX, y: snapY, code: '# python\n' };
      setNodes((s) => [...s, newNode]);
      setSelectedId(id);
    }

    window.addEventListener('click', onAnyClick);
    return () => window.removeEventListener('click', onAnyClick);
  }, []);

  function handleSelect(nodeId) {
    setSelectedId(nodeId);
  }

  function handleDelete(nodeId) {
    setNodes((s) => s.filter((n) => n.id !== nodeId));
    if (selectedId === nodeId) setSelectedId(null);
  }

  function handleSaveCode() {
    setNodes((s) => s.map((n) => (n.id === selectedId ? { ...n, code: codeDraft } : n)));
  }

  // Auto-migrate saved coordinates from a centered/limited layout to full viewport
  // This is a conservative transform assuming older layout width ~54rem (≈864px).
  function migrateNodes() {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const OLD_WIDTH = 54 * 16; // 54rem * 16px
    const OLD_HEIGHT = Math.max(600, window.innerHeight * 0.7);
    const scaleX = rect.width / OLD_WIDTH;
    const scaleY = rect.height / OLD_HEIGHT;
    setNodes((s) =>
      s.map((n) => {
        // scale then snap to parallelogram lattice
        const nx = Math.max(0, Math.min(rect.width, n.x * scaleX));
        const ny = Math.max(0, Math.min(rect.height, n.y * scaleY));
        const { sx, sy } = snapToDiagGrid(nx, ny);
        return { ...n, x: sx, y: sy };
      })
    );
  }

  // Reset nodes to random positions within the current board bounds
  function resetNodesRandom() {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    setNodes((s) =>
      s.map((n) => {
        const rx = Math.random() * (rect.width - GRID) + GRID / 2;
        const ry = Math.random() * (rect.height - GRID) + GRID / 2;
        const { sx, sy } = snapToDiagGrid(rx, ry);
        return { ...n, x: sx, y: sy };
      })
    );
  }

  // snap helper for horizontal + top-left-to-bottom-right diagonal lattice
  function snapToDiagGrid(px, py) {
    // Snap to rectangular grid intersections (only multiples of GRID)
    const gx = Math.round(px / GRID);
    const gy = Math.round(py / GRID);
    return { sx: GRID * gx, sy: GRID * gy };
  }

  // Return true when (px,py) is within SNAP_TOLERANCE of a grid intersection
  function isAtGridIntersection(px, py) {
    const gx = Math.round(px / GRID) * GRID;
    const gy = Math.round(py / GRID) * GRID;
    return Math.abs(px - gx) <= SNAP_TOLERANCE && Math.abs(py - gy) <= SNAP_TOLERANCE;
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1 style={{ margin: 0, fontSize: '14px' }}>VisualCode — Nodes</h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
          Click anywhere to create nodes. Select to edit.
        </p>
      </header>

      <div className="board-area">
        <div
          ref={boardRef}
          className="board"
          onClick={handleBoardClick}
          onMouseMove={handleBoardMouseMove}
          onMouseLeave={handleBoardMouseLeave}
        >
          {hoverPos ? (
            <div
              key="hover-preview"
              className="node preview"
              style={{ left: hoverPos.x + 'px', top: hoverPos.y + 'px' }}
            >
              <span className="node-dot" />
            </div>
          ) : null}
          {nodes.map((n) => (
            <div
              key={n.id}
              className={`node ${n.id === selectedId ? 'selected' : ''}`}
              style={{ left: n.x + 'px', top: n.y + 'px' }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(n.id);
              }}
              title={`Node ${n.id}`}
            >
              <span className="node-dot" />
            </div>
          ))}
        </div>

        <aside className="editor">
          {selectedId ? (
            (() => {
              const node = nodes.find((n) => n.id === selectedId);
              if (!node) return <div>Select a node</div>;
              return (
                <div>
                  <h3>Node {node.id}</h3>
                  <div className="coords">
                    x: {node.x}, y: {node.y}
                  </div>
                  <textarea
                    value={codeDraft}
                    onChange={(e) => setCodeDraft(e.target.value)}
                    rows={12}
                    placeholder="# Write Python code here"
                  />
                  {/* Save/Delete buttons removed per UX request; only Delete all nodes remains */}
                </div>
              );
            })()
          ) : (
            <div>
              <h3>No node selected</h3>
              <p>Click the grid to create a node.</p>
            </div>
          )}
          <div className="storage-note">
            Saved to localStorage key: <code>{STORAGE_KEY}</code>
          </div>

          <div className="import-export">
            {/* Only keep the global Delete all nodes button per request */}
            <button
              onClick={() => {
                if (!nodes || nodes.length === 0) return;
                if (
                  !globalThis.confirm('모든 노드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
                )
                  return;
                setNodes([]);
                setSelectedId(null);
              }}
              className="danger"
              title="Delete all nodes from the board and localStorage"
            >
              Delete all nodes
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
