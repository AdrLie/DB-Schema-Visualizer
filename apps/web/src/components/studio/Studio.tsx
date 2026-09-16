'use client';
  import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Share2, Save, Upload, Sparkles, ChevronDown, Code2 } from 'lucide-react';
import { PostgresParser } from '@schemaflow/schema-parser';
import { DatabaseSchema, DatabaseTable } from '@schemaflow/schema-core';
import { PostgresExporter } from '@schemaflow/schema-exporter';
import { SchemaCanvas } from '../canvas/SchemaCanvas';
import { SqlEditor } from '../editor/SqlEditor';
import { ExportModal } from '../export/ExportModal';
import { ExportDropdown } from '../ui/ExportDropdown';
import { TableEditorModal } from '../editor/TableEditorModal';
import { ToastContainer, toastManager } from '../ui/Toast';
import { AuthModal } from './AuthModal';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

/* ─── Autumn Harvest palette ───────────────────────────────
   #ede0d4  text-primary   (cream)
   #e6ccb2  text-secondary (warm beige)
   #ddb892  accent-light   (tan)
   #b08968  accent-mid     (medium brown)
   #9c6644  accent-strong
   #7f5539  accent-dark
   bg:      #120a05        (deep warm black)
   surface: #1c1009 / #231408
──────────────────────────────────────────────────────────── */

const DEFAULT_SQL = `CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  total DECIMAL(10,2)
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL
);
`;

const STORAGE_KEY = 'schemaflow_sql';
const CARDINALITY_KEY = 'schemaflow_cardinality';
const DIAGRAM_NAME_KEY = 'schemaflow_diagram_name';
type Cardinality = 'one-to-one' | 'one-to-many' | 'many-to-many';

function getInitialSql(): string {
  if (typeof window !== 'undefined') { const s = localStorage.getItem(STORAGE_KEY); if (s) return s; }
  return DEFAULT_SQL;
}
function getInitialDiagramName(): string {
  if (typeof window !== 'undefined') { const s = localStorage.getItem(DIAGRAM_NAME_KEY); if (s) return s; }
  return 'Untitled Diagram';
}
function getInitialCardinality(): Record<string, Cardinality> {
  if (typeof window !== 'undefined') { const s = localStorage.getItem(CARDINALITY_KEY); if (s) { try { return JSON.parse(s); } catch { /**/ } } }
  return {};
}

export function Studio() {
  const [sqlCode, setSqlCode] = useState(getInitialSql);
  const [diagramName, setDiagramName] = useState(getInitialDiagramName);
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [isEditorFullScreen, setIsEditorFullScreen] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [cardinalityMap, setCardinalityMap] = useState<Record<string, Cardinality>>(getInitialCardinality);
  const [token, setToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('schemaflow_token');
      if (t) setToken(t);
    }
  }, []);

  const handleAuthSuccess = (t: string) => { setToken(t); localStorage.setItem('schemaflow_token', t); setShowAuthModal(false); };
  const handleLogout = () => { setToken(null); localStorage.removeItem('schemaflow_token'); setActiveWorkspaceId(null); toastManager.addToast('Logged out', 'info'); };

  const currentStorageKey = activeWorkspaceId ? `schemaflow_sql_${activeWorkspaceId}` : STORAGE_KEY;
  const currentDiagramKey = activeWorkspaceId ? `schemaflow_diagram_${activeWorkspaceId}` : DIAGRAM_NAME_KEY;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSqlCode(localStorage.getItem(currentStorageKey) || DEFAULT_SQL);
      setDiagramName(localStorage.getItem(currentDiagramKey) || 'Untitled Diagram');
    }
  }, [activeWorkspaceId, currentStorageKey, currentDiagramKey]);

  const parser = useMemo(() => new PostgresParser(), []);
  const exporter = useMemo(() => new PostgresExporter(), []);

  useEffect(() => { localStorage.setItem(currentStorageKey, sqlCode); }, [sqlCode, currentStorageKey]);
  useEffect(() => {
    localStorage.setItem(currentDiagramKey, diagramName);
    document.title = diagramName ? `${diagramName} - DB Schema Visualizer` : 'Untitled - DB Schema Visualizer';
  }, [diagramName, currentDiagramKey]);
  useEffect(() => { localStorage.setItem(CARDINALITY_KEY, JSON.stringify(cardinalityMap)); }, [cardinalityMap]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setSqlCode(ev.target?.result as string); setDiagramName(file.name.replace(/\.sql$/i, '')); toastManager.addToast(`Imported ${file.name}!`, 'success'); };
    reader.readAsText(file); e.target.value = '';
  };

  const handleSaveClick = () => toastManager.addToast('Diagram saved.', 'success');
  const handleShareClick = () => { navigator.clipboard.writeText(window.location.href); toastManager.addToast('Link copied!', 'info'); };
  const handleCardinalityChange = useCallback((id: string, c: Cardinality) => setCardinalityMap(p => ({ ...p, [id]: c })), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try { const p = await parser.parse(sqlCode); if (alive) { setSchema(p); setParseError(null); } }
      catch (e: any) { if (alive) setParseError(e.message || 'Syntax error'); }
    })();
    return () => { alive = false; };
  }, [sqlCode, parser]);

  const handleTableSave = useCallback((updated: DatabaseTable) => {
    if (!schema) return;
    const tables = schema.tables.map(t => t.name === editingTableId ? updated : t);
    const relationships = tables.flatMap(t => (t.foreignKeys || []).map(fk => ({ id: fk.id, sourceTable: t.name, sourceColumns: fk.columns, targetTable: fk.referencedTable, targetColumns: fk.referencedColumns, cardinality: 'one-to-many' as const })));
    setSqlCode(exporter.export({ ...schema, tables, relationships }));
    setEditingTableId(null);
  }, [schema, editingTableId, exporter]);

  const handleAddTable = useCallback(() => {
    const names = schema?.tables.map(t => t.name) || [];
    let n = 'new_table'; let i = 1;
    while (names.includes(n)) { n = `new_table_${i++}`; }
    setSqlCode(p => p + `\n\nCREATE TABLE ${n} (\n  id UUID PRIMARY KEY\n);\n`);
    setTimeout(() => setEditingTableId(n), 300);
  }, [schema]);

  return (
    <div className="w-full h-screen relative overflow-hidden font-sans flex flex-col" style={{ background: '#120a05' }}>
      {/* Warm ambient glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, #b08968 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-0 right-0 w-[400px] h-[250px] opacity-8"
          style={{ background: 'radial-gradient(ellipse, #7f5539 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* ── Header ── */}
      <header className="relative z-50 h-[52px] shrink-0 flex items-center justify-between px-3 sm:px-4"
        style={{ background: 'rgba(18,10,5,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(176,137,104,0.12)', boxShadow: '0 1px 0 rgba(176,137,104,0.06)' }}>

        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          <WorkspaceSwitcher token={token} onLoginRequest={() => setShowAuthModal(true)} onLogout={handleLogout} activeWorkspaceId={activeWorkspaceId} onWorkspaceChange={setActiveWorkspaceId} />
          <span className="hidden sm:block select-none" style={{ color: 'rgba(176,137,104,0.2)', fontSize: 18 }}>/</span>
          <div className="hidden sm:flex items-center gap-2 rounded-lg px-2.5 py-1.5 min-w-0 focus-within:ring-1 transition-all"
            style={{ background: 'rgba(176,137,104,0.06)', border: '1px solid rgba(176,137,104,0.1)' }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#ddb892' }} />
            <input type="text" value={diagramName} onChange={e => setDiagramName(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none w-32 sm:w-44 truncate placeholder:opacity-30"
              style={{ color: '#ede0d4' }} placeholder="Untitled Diagram" />
          </div>
        </div>

        {/* Center: AI toggle */}
        <button onClick={() => setAiEnabled(v => !v)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all duration-300 select-none absolute left-1/2 -translate-x-1/2"
          style={{
            background: aiEnabled ? 'rgba(176,137,104,0.15)' : 'rgba(176,137,104,0.05)',
            border: aiEnabled ? '1px solid rgba(176,137,104,0.3)' : '1px solid rgba(176,137,104,0.1)',
            boxShadow: aiEnabled ? '0 0 12px rgba(176,137,104,0.2)' : 'none',
          }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: aiEnabled ? '#ddb892' : 'rgba(176,137,104,0.4)' }} />
          <span className="text-xs font-semibold transition-colors" style={{ color: aiEnabled ? '#ddb892' : 'rgba(176,137,104,0.35)' }}>AI</span>
          <div className="w-7 h-3.5 rounded-full transition-all duration-300 relative ml-0.5"
            style={{ background: aiEnabled ? '#9c6644' : 'rgba(176,137,104,0.15)' }}>
            <div className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-all duration-300"
              style={{ left: aiEnabled ? '13px' : '2px' }} />
          </div>
        </button>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          <HBtn icon={<Save className="w-3.5 h-3.5" />} label="Save" onClick={handleSaveClick} />
          <HBtn icon={<Share2 className="w-3.5 h-3.5" />} label="Share" onClick={handleShareClick} hideOnMobile />
          <HBtn icon={<Upload className="w-3.5 h-3.5" />} label="Import" onClick={handleImportClick} hideOnMobile chevron />
          <ExportDropdown onExportPostgres={() => setIsExporting(true)} diagramName={diagramName} />
        </div>
      </header>

      <input type="file" accept=".sql" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      {/* ── Main ── */}
      <div className="flex-1 flex relative z-10 overflow-hidden">
        {/* Editor */}
        <div className={`transition-all duration-500 ease-in-out flex-shrink-0 ${isEditorOpen ? isEditorFullScreen ? 'w-full opacity-100' : 'w-[260px] sm:w-[360px] md:w-[420px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
          <SqlEditor value={sqlCode} onChange={v => setSqlCode(v || '')} error={parseError}
            onClose={() => { setIsEditorOpen(false); if (isEditorFullScreen) setIsEditorFullScreen(false); }}
            onToggleFullScreen={() => setIsEditorFullScreen(!isEditorFullScreen)} isFullScreen={isEditorFullScreen} />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative" style={{ background: 'rgba(18,10,5,0.4)' }}>
          {!isEditorOpen && (
            <button onClick={() => setIsEditorOpen(true)} title="Open Schema Editor"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full transition-all shadow-lg group flex items-center justify-center"
              style={{ background: 'rgba(18,10,5,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(176,137,104,0.2)', color: '#b08968' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(176,137,104,0.25)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.45)'; (e.currentTarget as HTMLElement).style.color = '#ddb892'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.2)'; (e.currentTarget as HTMLElement).style.color = '#b08968'; }}>
              <Code2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          )}
          {schema ? (
            <SchemaCanvas schema={schema} onEditTable={setEditingTableId} onAddTable={handleAddTable} cardinalityMap={cardinalityMap} onCardinalityChange={handleCardinalityChange} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'rgba(176,137,104,0.4)' }}>Parsing schema…</div>
          )}
        </div>
      </div>

      {isExporting && schema && <ExportModal schema={schema} onClose={() => setIsExporting(false)} />}
      {editingTableId && schema && <TableEditorModal table={schema.tables.find(t => t.name === editingTableId)!} allTableNames={schema.tables.map(t => t.name)} onSave={handleTableSave} onClose={() => setEditingTableId(null)} />}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
      <ToastContainer />
    </div>
  );
}

function HBtn({ icon, label, onClick, hideOnMobile = false, chevron = false }: { icon: React.ReactNode; label: string; onClick: () => void; hideOnMobile?: boolean; chevron?: boolean }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${hideOnMobile ? 'hidden sm:flex' : 'flex'}`}
      style={{ background: 'rgba(176,137,104,0.07)', border: '1px solid rgba(176,137,104,0.12)', color: '#b08968' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.13)'; (e.currentTarget as HTMLElement).style.color = '#ddb892'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.22)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.07)'; (e.currentTarget as HTMLElement).style.color = '#b08968'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.12)'; }}>
      {icon}
      <span className="hidden md:inline">{label}</span>
      {chevron && <ChevronDown className="w-3 h-3 opacity-40" />}
    </button>
  );
}
