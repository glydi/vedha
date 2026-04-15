import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API = "http://localhost:8080/api/snippets";

const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go",
  "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "HTML", "CSS",
  "Shell", "Directives", "YAML", "JSON", "Other",
];

/* ────────────────────────────────────────────────────── */
/*  Notifications                                         */
/* ────────────────────────────────────────────────────── */
function Toasts({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────── */
/*  Overlay                                               */
/* ────────────────────────────────────────────────────── */
function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p style={{ marginTop: '20px', color: '#666' }}>{message}</p>
        <div className="modal-actions" style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>CANCEL</button>
          <button className="btn btn-primary btn-sm" style={{ background: '#ff4444', color: '#000', borderColor: '#ff4444' }} onClick={onConfirm}>DELETE</button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────── */
/*  Application                                           */
/* ────────────────────────────────────────────────────── */
function App() {
  const [view, setView] = useState("home");
  const [snippets, setSnippets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeSnippet, setActiveSnippet] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formTitle, setFormTitle] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formLang, setFormLang] = useState("JavaScript");
  const [formDesc, setFormDesc] = useState("");

  const toast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2000);
  }, []);

  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSnippets(data);
      setFiltered(data);
    } catch {
      toast("BACKEND_UNREACHABLE", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      snippets.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.language?.toLowerCase().includes(q) ||
          s.code?.toLowerCase().includes(q)
      )
    );
  }, [search, snippets]);

  const goList = () => { fetchSnippets(); setView("list"); setSearch(""); };
  const goCreate = () => { resetForm(); setView("create"); };
  const goView = (id) => {
    const s = snippets.find(x => x.id === id);
    if (s) { setActiveSnippet(s); setView("view"); }
  };
  const goEdit = (s) => {
    setFormTitle(s.title || "");
    setFormCode(s.code || "");
    setFormLang(s.language || "JavaScript");
    setFormDesc(s.description || "");
    setActiveSnippet(s);
    setView("edit");
  };

  const resetForm = () => {
    setFormTitle(""); setFormCode(""); setFormLang("JavaScript"); setFormDesc(""); setActiveSnippet(null);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formCode.trim()) return toast("REQUIRED_FIELDS_MISSING", "error");

    const payload = { title: formTitle.trim(), code: formCode, language: formLang, description: formDesc.trim() };
    setLoading(true);
    try {
      const isEdit = view === "edit" && activeSnippet;
      const res = await fetch(isEdit ? `${API}/${activeSnippet.id}` : API, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast(isEdit ? "UPDATED" : "STORED");
      goList();
    } catch {
      toast("SAVE_ERROR", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API}/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("REMOVED");
      setDeleteTarget(null);
      goList();
    } catch {
      toast("DELETE_ERROR", "error");
    }
  };

  const copyCode = async (c) => {
    await navigator.clipboard.writeText(c);
    toast("COPIED");
  };

  const pasteCode = async () => {
    const text = await navigator.clipboard.readText();
    if (text) { setFormCode(text); toast("PASTED"); }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toISOString().split('T')[0].replace(/-/g, '/');
  };

  const truncate = (str, n) => str?.length > n ? str.slice(0, n) : str;

  return (
    <>
      <Toasts toasts={toasts} />
      {deleteTarget && (
        <ConfirmModal
          title="DELETE_ENTRY"
          message={`CONFIRM REMOVAL OF: ${deleteTarget.title}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <header className="app-header">
        <div className="logo" onClick={() => setView("home")}>
          <div className="logo-text">VAULT<span>.00</span></div>
        </div>
        <nav className="nav-actions">
          <button className="btn btn-ghost btn-sm" onClick={goList}>BROWSE</button>
          <button className="btn btn-primary btn-sm" onClick={goCreate}>NEW</button>
        </nav>
      </header>

      {view === "home" && (
        <section className="hero-section">
          <h1>THE VAULT</h1>
          <p className="hero-subtitle">MINIMALIST REPOSITORY FOR ARCHIVING CODE FRAGMENTS.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={goCreate}>NEW_ENTRY</button>
            <button className="btn btn-secondary" onClick={goList}>BROWSE_ENTRIES</button>
          </div>
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-value">{snippets.length}</div>
              <div className="stat-label">TOTAL_ENTRIES</div>
            </div>
          </div>
        </section>
      )}

      {view === "list" && (
        <section>
          <div className="toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="SEARCH_QUERY..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {loading && <div className="spinner" />}

          <div className="snippet-grid">
            {filtered.map((s) => (
              <div key={s.id} className="card snippet-card" onClick={() => goView(s.id)}>
                <span className="snippet-lang">{s.language}</span>
                <span className="snippet-title">{s.title}</span>
                <div className="snippet-preview">{truncate(s.code, 100)}</div>
                <div className="snippet-meta">
                  <span>{formatDate(s.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {view === "view" && activeSnippet && (
        <section className="detail-page">
          <div className="detail-header">
            <h2>{activeSnippet.title}</h2>
          </div>
          <div className="detail-meta-bar" style={{ marginTop: '20px' }}>
            <span className="meta-chip">[{activeSnippet.language}]</span>
            <span className="meta-chip">DATE: {formatDate(activeSnippet.createdAt)}</span>
          </div>

          <div className="detail-code">{activeSnippet.code}</div>

          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => copyCode(activeSnippet.code)}>COPY</button>
            <button className="btn btn-secondary btn-sm" onClick={() => goEdit(activeSnippet)}>EDIT</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(activeSnippet)}>DELETE</button>
            <button className="btn btn-ghost btn-sm" onClick={goList}>RETURN</button>
          </div>
        </section>
      )}

      {(view === "create" || view === "edit") && (
        <section className="form-page">
          <div className="card">
            <h2>{view === "edit" ? "UPDATE_ENTRY" : "INITIALIZE_ENTRY"}</h2>
            <div className="form-group" style={{ marginTop: '40px' }}>
              <label className="form-label">IDENTIFIER</label>
              <input className="form-input" type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">LANGUAGE</label>
              <select className="form-select" value={formLang} onChange={(e) => setFormLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">BLOCK</label>
              <textarea className="code-textarea" value={formCode} onChange={(e) => setFormCode(e.target.value)} />
            </div>
            <div className="form-actions" style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
              <button className="btn btn-primary" onClick={handleSave}>COMMIT</button>
              <button className="btn btn-secondary" onClick={() => setView("home")}>DISCARD</button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default App;
