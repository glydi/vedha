import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Search,
    Code2,
    Trash2,
    Edit3,
    Copy,
    ChevronLeft,
    ChevronRight,
    Monitor,
    Calendar,
    Layers,
    Check,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
    const [snippets, setSnippets] = useState([]);
    const [selectedSnippet, setSelectedSnippet] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [justCopied, setJustCopied] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        language: 'javascript',
        description: '',
        tags: [],
        isPublic: false
    });

    useEffect(() => {
        fetchSnippets();
    }, []);

    const fetchSnippets = async () => {
        try {
            const response = await axios.get('/api/snippets');
            setSnippets(response.data);
        } catch (error) {
            console.error('Error fetching snippets:', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (selectedSnippet?.id) {
                await axios.put(`/api/snippets/${selectedSnippet.id}`, formData);
            } else {
                await axios.post('/api/snippets', formData);
            }
            setIsEditing(false);
            fetchSnippets();
        } catch (error) {
            console.error('Error saving snippet:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Discard this snippet forever?')) return;
        try {
            await axios.delete(`/api/snippets/${id}`);
            setSelectedSnippet(null);
            fetchSnippets();
        } catch (error) {
            console.error('Error deleting snippet:', error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 2000);
    };

    const filteredSnippets = snippets.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.language.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen overflow-hidden bg-black text-[#EDEDED] font-sans selection:bg-white selection:text-black">

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className="glass-panel relative flex flex-col z-20"
            >
                <div className="p-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                        <Code2 size={18} className="text-black" />
                    </div>
                    <span className="font-bold text-lg tracking-tighter uppercase">Vault</span>
                </div>

                <div className="px-6 mb-8">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={14} />
                        <input
                            type="text"
                            placeholder="Jump to..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full search-input pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide">
                    <div className="px-4 py-2 text-[10px] font-bold text-[#444] uppercase tracking-[0.2em]">
                        Collections
                    </div>
                    {filteredSnippets.map(snippet => (
                        <button
                            key={snippet.id}
                            onClick={() => {
                                setSelectedSnippet(snippet);
                                setFormData(snippet);
                                setIsEditing(false);
                            }}
                            className={`w-full text-left px-4 py-4 rounded-xl sidebar-item ${selectedSnippet?.id === snippet.id ? 'active' : ''
                                }`}
                        >
                            <div className="font-medium text-[13px] tracking-tight truncate">{snippet.title}</div>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#555] font-bold uppercase tracking-wider">
                                <span className="px-1.5 py-0.5 rounded bg-[#111] border border-[#222]">{snippet.language}</span>
                                <span>•</span>
                                <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    <button
                        onClick={() => {
                            setIsEditing(true);
                            setSelectedSnippet(null);
                            setFormData({ title: '', content: '', language: 'javascript', description: '', tags: [], isPublic: false });
                        }}
                        className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Create Snippet
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative bg-[#020202]">

                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-12 glass flex items-center justify-center z-30 opacity-40 hover:opacity-100 rounded-full"
                >
                    {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>

                {/* Dynamic Header */}
                <header className="h-20 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between px-10">
                    <div className="flex items-center gap-6">
                        {!isSidebarOpen && <span className="font-bold tracking-tighter text-sm uppercase">VAULT</span>}
                        {selectedSnippet && (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-[#444] uppercase tracking-widest">
                                <Layers size={12} />
                                <span>/</span>
                                <span className="text-white">{selectedSnippet.title}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedSnippet && !isEditing && (
                            <>
                                <button onClick={() => setIsEditing(true)} className="btn-icon">
                                    <Edit3 size={18} />
                                </button>
                                <button onClick={() => handleDelete(selectedSnippet.id)} className="btn-icon hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                                <div className="w-[1px] h-4 bg-[#222] mx-2" />
                                <button
                                    onClick={() => copyToClipboard(selectedSnippet.content)}
                                    className="px-4 py-2 glass rounded-lg text-xs font-bold border border-[#222] flex items-center gap-2 hover:bg-white hover:text-black transition-all"
                                >
                                    {justCopied ? <Check size={14} /> : <Copy size={14} />}
                                    {justCopied ? 'COPIED' : 'COPY'}
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-12 scroll-smooth">
                    <div className="max-w-4xl mx-auto w-full">
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    onSubmit={handleSave}
                                    className="space-y-10"
                                >
                                    <div className="space-y-6">
                                        <input
                                            type="text"
                                            placeholder="Snippet Title..."
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full text-5xl font-bold bg-transparent border-none p-0 focus:ring-0 placeholder-[#111] tracking-tighter"
                                            autoFocus
                                            required
                                        />
                                        <div className="flex items-center gap-4">
                                            <select
                                                value={formData.language}
                                                onChange={e => setFormData({ ...formData, language: e.target.value })}
                                                className="bg-[#0a0a0a] border border-[#222] rounded-lg text-[11px] font-bold uppercase tracking-wider py-1.5 px-3 outline-none"
                                            >
                                                <option value="javascript">JS</option>
                                                <option value="typescript">TS</option>
                                                <option value="python">PY</option>
                                                <option value="java">JAVA</option>
                                                <option value="html">HTML</option>
                                                <option value="css">CSS</option>
                                                <option value="sql">SQL</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Optional description..."
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="flex-1 bg-transparent border-none text-sm text-[#888] p-0 outline-none placeholder-[#222]"
                                            />
                                        </div>
                                    </div>

                                    <div className="editor-surface p-1">
                                        <textarea
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full min-h-[450px] font-mono p-8 bg-black border-none text-[14px] leading-relaxed outline-none scrollbar-hide"
                                            placeholder="// Insert code here..."
                                            spellCheck="false"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <button type="button" onClick={() => setIsEditing(false)} className="text-xs font-bold tracking-widest text-[#444] uppercase hover:text-white transition-colors">Abort</button>
                                        <button type="submit" className="btn-primary px-10 py-3 rounded-xl text-xs uppercase tracking-widest">Commit Snippet</button>
                                    </div>
                                </motion.form>
                            ) : selectedSnippet ? (
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-[#555] uppercase tracking-[0.3em]">
                                            <Monitor size={12} />
                                            <span>{selectedSnippet.language}</span>
                                            <Calendar size={12} className="ml-2" />
                                            <span>{new Date(selectedSnippet.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h1 className="text-6xl font-bold tracking-tighter leading-none">{selectedSnippet.title}</h1>
                                        {selectedSnippet.description && (
                                            <p className="text-[#666] text-xl leading-relaxed max-w-2xl">{selectedSnippet.description}</p>
                                        )}
                                    </div>

                                    <div className="editor-surface relative group">
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-[var(--radius)]" />
                                        <pre className="p-10 overflow-x-auto">
                                            <code className={`language-${selectedSnippet.language}`}>
                                                {selectedSnippet.content}
                                            </code>
                                        </pre>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8">
                                    <div className="w-24 h-24 rounded-3xl bg-[#0a0a0a] border border-[#111] flex items-center justify-center">
                                        <Monitor size={32} className="text-[#222]" />
                                        <div className="absolute w-24 h-24 bg-white/5 blur-3xl rounded-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold tracking-tight">System Idle</h2>
                                        <p className="text-[#444] text-sm max-w-xs mx-auto">Access your repository by selecting a snippet or create a new entry to begin.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-8 py-3 glass rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] border border-[#222] hover:bg-white hover:text-black transition-all"
                                    >
                                        Initialize Snippet
                                    </button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
