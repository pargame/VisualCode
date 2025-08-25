import React, { useEffect, useRef, useState } from 'react';

const GRID = 24;
const STORAGE_KEY = 'visualcode_nodes_v1';

function loadNodes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveNodes(nodes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
}

export default function App() {
  const [nodes, setNodes] = useState(() => loadNodes());
  const [selectedId, setSelectedId] = useState(null);
  const [codeDraft, setCodeDraft] = useState('');
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { sx: snapX, sy: snapY } = snapToDiagGrid(x, y);

    const id = Date.now();
    const newNode = { id, x: snapX, y: snapY, code: '# python\n' };
    setNodes((s) => [...s, newNode]);
    setSelectedId(id);
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

      // compute coordinates relative to the viewport so clicks anywhere map to the board
      // (the board is fixed to inset:0 so viewport coords match board coords)
      const rect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      // clamp to viewport bounds
      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));
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
    // basis e1 = (GRID, 0), e2 = (GRID, GRID)
    const a = (px - py) / GRID; // coefficient along e1 relative
    const b = py / GRID; // coefficient along e2
    const aR = Math.round(a);
    const bR = Math.round(b);
    const sx = GRID * (aR + bR);
    const sy = GRID * bR;
    return { sx, sy };
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
        <div ref={boardRef} className="board" onClick={handleBoardClick}>
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
                  <div className="editor-actions">
                    <button onClick={handleSaveCode}>Save code</button>
                    <button onClick={() => handleDelete(node.id)} className="danger">
                      Delete node
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div>
              <h3>No node selected</h3>
              <p>Click the grid to create a node, then select it to edit Python code.</p>
            </div>
          )}
          <div className="storage-note">
            Saved to localStorage key: <code>{STORAGE_KEY}</code>
          </div>

          <div className="import-export">
            <input
              id="import-file"
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => {
                  try {
                    const parsed = JSON.parse(r.result);
                    if (Array.isArray(parsed)) {
                      setNodes(parsed);
                      setSelectedId(parsed.length ? parsed[0].id : null);
                    }
                  } catch (err) {
                    // ignore invalid file
                  }
                };
                r.readAsText(f);
                // reset the input so same file can be re-selected later
                e.target.value = '';
              }}
            />
            <button onClick={() => document.getElementById('import-file').click()}>
              Import nodes (.json)
            </button>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(nodes, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `visualcode-nodes-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
            >
              Export nodes (.json)
            </button>
            <button
              onClick={migrateNodes}
              title="Try to scale saved node coordinates to current board size"
            >
              Auto-migrate positions
            </button>
            <button onClick={resetNodesRandom} title="Randomize existing nodes across the board">
              Reset positions
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
