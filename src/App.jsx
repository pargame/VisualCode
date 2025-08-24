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
    const snapX = Math.round(x / GRID) * GRID;
    const snapY = Math.round(y / GRID) * GRID;

    const id = Date.now();
    const newNode = { id, x: snapX, y: snapY, code: '# python\n' };
    setNodes((s) => [...s, newNode]);
    setSelectedId(id);
  }

  // allow creating nodes by clicking anywhere (outside interactive controls)
  useEffect(() => {
    function onAnyClick(e) {
      // ignore clicks that originate from interactive controls, nodes/editor, or the board itself
      const el = e.target;
      if (!boardRef.current) return;
      // defensive: some elements may not implement closest
      const isInteractive = (() => {
        try {
          return (
            (el &&
              el.closest &&
              (el.closest('.editor') ||
                el.closest('button') ||
                el.closest('textarea') ||
                el.closest('input') ||
                el.closest('.node') ||
                el.closest('.board'))) ||
            false
          );
        } catch (err) {
          return false;
        }
      })();

      if (isInteractive) return;

      // compute coordinates relative to the board and clamp to its bounds
      const rect = boardRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      // clamp so clicks outside still produce a visible node along the board edges
      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));
      const snapX = Math.round(x / GRID) * GRID;
      const snapY = Math.round(y / GRID) * GRID;

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
          </div>
        </aside>
      </div>
    </div>
  );
}
