import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API = "/api/snippets";

const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go",
  "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "SQL", "HTML", "CSS",
  "Markdown", "Shell", "YAML", "JSON", "XML", "GraphQL", "Docker", "Nginx",
  "Lua", "Perl", "R", "Objective-C", "Assembly", "Directives", "Other",
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
        <p style={{ marginTop: '20px', color: '#fff' }}>{message}</p>
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
  const [page, setPage] = useState(0);
  const pageSize = 5; // Increased page size

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLangs, setSelectedLangs] = useState([]);

  const [githubUrl, setGithubUrl] = useState("");
  const [isCollabActive, setIsCollabActive] = useState(false);
  const stompClient = useRef(null);

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [formTitle, setFormTitle] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formLang, setFormLang] = useState("JavaScript");
  const [formDesc, setFormDesc] = useState("");
  const [formTags, setFormTags] = useState([]);
  const [tempTag, setTempTag] = useState("");
  const [formPublic, setFormPublic] = useState(true);
  const [formSharedWith, setFormSharedWith] = useState([]);
  const [tempShareUser, setTempShareUser] = useState("");

  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const toast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2000);
  }, []);

  const connectWebSocket = useCallback((snippetId) => {
    if (stompClient.current) return;

    const socket = new SockJS('/ws');
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setIsCollabActive(true);
        stompClient.current.subscribe('/topic/updates', (msg) => {
          const body = JSON.parse(msg.body);
          if (body.id === snippetId && body.sender !== (user?.username || "anon")) {
            setFormCode(body.code);
          }
        });
      },
      onDisconnect: () => setIsCollabActive(false),
    });
    stompClient.current.activate();
  }, [user]);

  const disconnectWebSocket = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
      setIsCollabActive(false);
    }
  }, []);

  const sendUpdate = (code) => {
    if (stompClient.current && stompClient.current.connected && activeSnippet) {
      stompClient.current.publish({
        destination: '/app/edit',
        body: JSON.stringify({
          id: activeSnippet.id,
          code,
          sender: user?.username || "anon"
        })
      });
    }
  };

  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    try {
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(API, { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSnippets(data);
      setFiltered(data);
      return data;
    } catch {
      toast("BACKEND_UNREACHABLE", "error");
    } finally {
      setLoading(false);
    }
  }, [toast, token]);
  useEffect(() => {
    fetchSnippets().then(data => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id && data) {
        const s = data.find(x => x.id === parseInt(id));
        if (s) { setActiveSnippet(s); setView("view"); }
      }
    });
  }, [fetchSnippets]);

  useEffect(() => {
    if (!search.trim() && !startDate && !endDate && selectedLangs.length === 0) {
      setFiltered([]);
      return;
    }

    let results = (snippets || []);

    // 1. Keyword search (and '*' logic)
    const q = search.trim().toLowerCase();
    if (q && q !== "*") {
      results = results.filter((s) => {
        const titleMatch = s.title?.toLowerCase().includes(q);
        const codeMatch = s.code?.toLowerCase().includes(q);
        const tagMatch = s.tags?.some((t) => t.name?.toLowerCase().includes(q));
        const idMatch = s.id.toString().includes(q);
        return titleMatch || codeMatch || tagMatch || idMatch;
      });
    }

    // 2. Language filters
    if (selectedLangs.length > 0) {
      results = results.filter(s => selectedLangs.includes(s.language));
    }

    // 3. Date range filters
    if (startDate) {
      results = results.filter(s => new Date(s.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      results = results.filter(s => new Date(s.createdAt) <= end);
    }

    setFiltered(results);
    setPage(0);
  }, [search, snippets, startDate, endDate, selectedLangs]);

  useEffect(() => {
    setPage(0);
  }, [view]);

  const goList = () => { fetchSnippets(); setView("list"); setSearch(""); };
  const goCreate = () => {
    resetForm();
    if (!user) {
      setFormPublic(true);
      toast("LOG_IN_TO_CREATE_PRIVATE_SNIPPETS");
    }
    setView("create");
  };
  const goView = (id) => {
    const s = snippets.find(x => x.id === id);
    if (s) { setActiveSnippet(s); setView("view"); }
  };
  const goEdit = (s) => {
    if (!user) { setView("login"); return; }
    setFormTitle(s.title || "");
    setFormCode(s.code || "");
    setFormLang(s.language || "JavaScript");
    setFormDesc(s.description || "");
    setFormTags(s.tags?.map(t => t.name) || []);
    setFormPublic(s.isPublic ?? true);
    setFormSharedWith(s.sharedWith?.map(u => u.username) || []);
    setActiveSnippet(s);
    setView("edit");
    connectWebSocket(s.id);
  };

  const handleGoHome = () => {
    disconnectWebSocket();
    setView("home");
  };

  const handleFinishEditing = () => {
    disconnectWebSocket();
    goList();
  };

  const resetForm = () => {
    setFormTitle(""); setFormCode(""); setFormLang("JavaScript"); setFormDesc("");
    setFormTags([]); setTempTag(""); setFormPublic(true); setActiveSnippet(null);
    setFormSharedWith([]); setTempShareUser("");
    disconnectWebSocket();
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername, password: authPassword }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser({ username: data.username });
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify({ username: data.username }));
      localStorage.setItem("token", data.token);
      toast("WELCOME_BACK");
      goList();
    } catch {
      toast("LOGIN_FAILED", "error");
    }
  };

  const handleSignup = async () => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername, email: authEmail, password: authPassword }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser({ username: data.username });
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify({ username: data.username }));
      localStorage.setItem("token", data.token);
      toast("ACCOUNT_CREATED");
      goList();
    } catch {
      toast("SIGNUP_FAILED", "error");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast("LOGGED_OUT");
    setView("home");
  };

  const addTag = (e) => {
    if (e.key === "Enter" && tempTag.trim()) {
      if (!formTags.includes(tempTag.trim())) {
        setFormTags([...formTags, tempTag.trim()]);
      }
      setTempTag("");
    }
  };

  const removeTag = (tag) => setFormTags(formTags.filter(t => t !== tag));

  const handleSave = async () => {
    if (!formTitle.trim() || !formCode.trim()) return toast("REQUIRED_FIELDS_MISSING", "error");

    const payload = {
      title: formTitle.trim(),
      code: formCode,
      language: formLang,
      description: formDesc.trim(),
      isPublic: formPublic,
      tags: formTags.map(name => ({ name })),
      sharedWith: formSharedWith.map(username => ({ username })),
      githubUrl: githubUrl
    };

    setLoading(true);
    try {
      const isEdit = view === "edit" && activeSnippet;
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(isEdit ? `${API}/${activeSnippet.id}` : API, {
        method: isEdit ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast(isEdit ? "UPDATED" : "STORED");
      handleFinishEditing();
    } catch {
      toast("SAVE_ERROR", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API}/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      toast("REMOVED");
      setDeleteTarget(null);
      goList();
    } catch {
      toast("DELETE_ERROR", "error");
    }
  };

  const importFromGithub = async () => {
    if (!githubUrl.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/snippets/github?url=${encodeURIComponent(githubUrl)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFormCode(data.code);
      toast("GITHUB_IMPORT_SUCCESS");
    } catch {
      toast("GITHUB_IMPORT_ERROR", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestIdentifier = async () => {
    if (!formCode.trim()) {
      toast("PLEASE ENTER SOME CODE FIRST", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("https://text.pollinations.ai/prompt/" + encodeURIComponent("Suggest a short, 1 to 4 word camelCase or PascalCase identifier/name/title for this code snippet: " + formCode.substring(0, 500)));
      const text = await response.text();
      setFormTitle(text.replace(/[^a-zA-Z0-9_\s]/g, '').trim().split('\n')[0]);
      toast("AI SUGGESTED AN IDENTIFIER");
    } catch {
      toast("LLM_SUGGESTION_FAILED", "error");
    } finally {
      setLoading(false);
    }
  };

  const maskId = (id) => `*****${id.toString().slice(-3)}`;

  const toggleLang = (lang) => {
    setSelectedLangs(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const copyCode = async (c) => {
    await navigator.clipboard.writeText(c);
    toast("COPIED");
  };

  const pasteCode = async () => {
    const text = await navigator.clipboard.readText();
    if (text) { setFormCode(text); toast("PASTED"); }
  };

  const shareSnippet = async (s) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${s.id}`;
    await navigator.clipboard.writeText(url);
    toast("LINK_COPIED");
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toISOString().split('T')[0].replace(/-/g, '/');
  };

  const truncate = (str, n) => str?.length > n ? str.slice(0, n) : str;

  const scrollUp = () => {
    if (view === "list") {
      setPage(p => Math.max(0, p - 1));
    } else {
      window.scrollBy({ top: -window.innerHeight, behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    if (view === "list") {
      setPage(p => (p + 1) * pageSize < filtered.length ? p + 1 : p);
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  return (
    <>
      <Toasts toasts={toasts} />

      <div className="scroll-nav">
        <button className="scroll-btn" onClick={scrollUp} title="GO UP">↑</button>
        <button className="scroll-btn" onClick={scrollDown} title="GO DOWN">↓</button>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="DELETE_ENTRY"
          message={`CONFIRM REMOVAL OF: ${deleteTarget.title}`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <header className="app-header">
        <div className="logo" onClick={handleGoHome}>
          <div className="logo-text">VEDHA<span>.01</span></div>
        </div>
        <nav className="nav-actions">
          <button className="btn btn-ghost btn-sm" onClick={goList}>BROWSE</button>
          <button className="btn btn-primary btn-sm" onClick={goCreate}>NEW</button>
          <div className="nav-divider" style={{ width: '1px', background: 'var(--border)', margin: '0 8px' }} />
          {user ? (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', letterSpacing: '0.1em', fontWeight: '700' }}>{user.username.toUpperCase()}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>LOGOUT</button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => setView("login")}>LOGIN</button>
          )}
        </nav>
      </header>

      {(view === "login" || view === "signup") && (
        <section className="form-page">
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2>{view === "login" ? "ACCESS_RESTRICTED" : "INITIALIZE_ACCOUNT"}</h2>
            <div className="form-group" style={{ marginTop: '40px' }}>
              <label className="form-label">USERNAME</label>
              <input
                className="form-input"
                type="text"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                autoFocus
              />
            </div>
            {view === "signup" && (
              <div className="form-group">
                <label className="form-label">EMAIL</label>
                <input className="form-input" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <input
                className="form-input"
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (view === "login" ? handleLogin() : handleSignup())}
              />
            </div>
            <div className="form-actions" style={{ flexDirection: 'column', gap: '20px', marginTop: '40px' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={view === "login" ? handleLogin : handleSignup}>
                {view === "login" ? "AUTHENTICATE" : "REGISTER"}
              </button>
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setView(view === "login" ? "signup" : "login")}>
                {view === "login" ? "NO_ACCOUNT?_SIGNUP" : "ALREADY_REGISTERED?_LOGIN"}
              </button>
            </div>
          </div>
        </section>
      )}

      {view === "home" && (
        <section className="hero-section">
          <h1>VEDHA</h1>
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
                placeholder="SEARCH_QUERY (use * for all)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="filter-bar">
              <div className="filter-group">
                <label className="form-label">START_DATE</label>
                <input className="filter-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="filter-group">
                <label className="form-label">END_DATE</label>
                <input className="filter-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div className="filter-group" style={{ flex: 1 }}>
                <label className="form-label">LANGUAGE_FILTER</label>
                <select
                  className="filter-input"
                  style={{ width: '100%' }}
                  onChange={(e) => {
                    if (e.target.value && !selectedLangs.includes(e.target.value)) {
                      setSelectedLangs([...selectedLangs, e.target.value]);
                    }
                  }}
                  value=""
                >
                  <option value="" disabled>SELECT_LANGUAGE...</option>
                  {LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {selectedLangs.map(l => (
                    <span key={l} className="tag-chip active" onClick={() => toggleLang(l)}>
                      {l} &times;
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setStartDate(""); setEndDate(""); setSelectedLangs([]); }}>RESET_FILTERS</button>
            </div>
          </div>

          {loading && <div className="spinner" />}

          {!loading && !search.trim() && (
            <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.5 }}>
              <h3>ENTER_QUERY_TO_REVEAL_DATA</h3>
              <p style={{ marginTop: '10px', fontSize: '12px' }}>BEGIN TYPING TO ACCESS THE VAULT</p>
            </div>
          )}

          {filtered.length === 0 && search.trim() && !loading && (
            <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.5 }}>
              <h3>NO_RESULTS_FOUND</h3>
            </div>
          )}

          <div className="snippet-grid">
            {filtered.slice(page * pageSize, (page + 1) * pageSize).map((s) => (
              <div key={s.id} className="card snippet-card" onClick={() => goView(s.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span className="id-display">{maskId(s.id)}</span>
                    <span className="snippet-lang">{s.language}</span>
                  </div>
                  {!s.isPublic && <span className="meta-chip">PRIVATE</span>}
                </div>
                <span className="snippet-title">{s.title}</span>
                <div className="tag-container" style={{ marginBottom: '16px' }}>
                  {s.tags?.map(t => <span key={t.id} className="tag-chip">{t.name}</span>)}
                </div>
                <div className="snippet-preview">{truncate(s.code, 100)}</div>
                <div className="snippet-meta">
                  <span>{formatDate(s.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length > pageSize && (
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '10px', letterSpacing: '0.2em', opacity: 0.5 }}>
              PAGE {page + 1} OF {Math.ceil(filtered.length / pageSize)}
            </div>
          )}
        </section>
      )}

      {view === "view" && activeSnippet && (
        <section className="detail-page">
          <div className="detail-header">
            <h2>{activeSnippet.title}</h2>
          </div>
          <div className="detail-meta-bar" style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
            <span className="meta-chip">[{activeSnippet.language}]</span>
            <span className="meta-chip">DATE: {formatDate(activeSnippet.createdAt)}</span>
            {!activeSnippet.isPublic && <span className="meta-chip" style={{ color: '#ff4444' }}>PRIVATE_ENTRY</span>}
          </div>

          <div className="tag-container">
            {activeSnippet.tags?.map(t => <span key={t.id} className="tag-chip active">{t.name}</span>)}
          </div>

          <div className="detail-code">
            <SyntaxHighlighter
              language={activeSnippet.language?.toLowerCase() || "javascript"}
              style={vscDarkPlus}
              customStyle={{ background: 'transparent', padding: 0 }}
            >
              {activeSnippet.code}
            </SyntaxHighlighter>
          </div>

          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => copyCode(activeSnippet.code)}>COPY</button>
            <button className="btn btn-primary btn-sm" onClick={() => shareSnippet(activeSnippet)}>SHARE</button>
            <button className="btn btn-secondary btn-sm" onClick={() => goEdit(activeSnippet)}>EDIT</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(activeSnippet)}>DELETE</button>
            <button className="btn btn-ghost btn-sm" onClick={goList}>RETURN</button>
          </div>
        </section>
      )}

      {isCollabActive && <div className="collab-status">LIVE_COLLAB_ACTIVE</div>}

      {(view === "create" || view === "edit") && (
        <section className="form-page">
          <div className="card">
            <h2>{view === "edit" ? "UPDATE_ENTRY" : "INITIALIZE_ENTRY"}</h2>

            <div className="github-import">
              <input
                className="form-input"
                placeholder="GITHUB_GIST_RAW_URL"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
              />
              <button className="btn btn-primary" onClick={importFromGithub}>IMPORT</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>IDENTIFIER</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleSuggestIdentifier} disabled={loading} style={{ padding: '2px 6px', fontSize: '10px' }}>AI SUGGEST</button>
                </label>
                <input className="form-input" type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">LANGUAGE</label>
                <select className="form-select" value={formLang} onChange={(e) => setFormLang(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">TAGS (PRESS ENTER)</label>
              <div className="tag-input-container">
                {formTags.map(t => (
                  <div key={t} className="tag-pill">
                    {t} <button onClick={() => removeTag(t)}>&times;</button>
                  </div>
                ))}
                <input
                  className="form-input"
                  style={{ border: 'none', borderBottom: '1px solid var(--border)', flex: 1 }}
                  type="text"
                  value={tempTag}
                  onChange={(e) => setTempTag(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="ADD TAG..."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div className="form-group">
                <label className="form-label">ACCESS_CONTROL</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${formPublic ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormPublic(true)}
                  >PUBLIC</button>
                  <button
                    type="button"
                    className={`btn btn-sm ${!formPublic ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      if (!user) {
                        toast("LOG_IN_TO_CREATE_PRIVATE_SNIPPETS", "error");
                        return;
                      }
                      setFormPublic(false);
                    }}
                  >PRIVATE</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">SHARE_WITH_USER</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    className="form-input"
                    placeholder="USERNAME"
                    value={tempShareUser}
                    onChange={e => setTempShareUser(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && tempShareUser.trim()) {
                        setFormSharedWith([...formSharedWith, tempShareUser.trim()]);
                        setTempShareUser("");
                      }
                    }}
                  />
                </div>
                <div className="access-control-list">
                  {formSharedWith.map(u => (
                    <div key={u} className="access-item">
                      {u} <button className="btn btn-ghost btn-sm" onClick={() => setFormSharedWith(formSharedWith.filter(x => x !== u))}>REMOVE</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">BLOCK</label>
              <textarea
                className="code-textarea"
                value={formCode}
                onChange={(e) => {
                  setFormCode(e.target.value);
                  sendUpdate(e.target.value);
                }}
              />
            </div>

            <div className="form-actions" style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
              <button className="btn btn-primary" onClick={handleSave}>COMMIT</button>
              <button className="btn btn-secondary" onClick={handleFinishEditing}>DISCARD</button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default App;
