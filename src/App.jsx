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
    // only create node when clicking directly on the board (not on a node)
    if (e.target !== boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snapX = Math.round(x / GRID) * GRID;
    const snapY = Math.round(y / GRID) * GRID;

    const id = Date.now();
    const newNode = { id, x: snapX, y: snapY, code: '# python\n' };
    setNodes((s) => [...s, newNode]);
    setSelectedId(id);
  }

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

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>pargame / VisualCode — Nodes</h1>
        <p>Click any grid cell to create a node. Select a node to edit its Python code.</p>
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
        </aside>
      </div>
    </div>
  );
}
