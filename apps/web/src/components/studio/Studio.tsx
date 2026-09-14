'use client';
  import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Database, Share2, Save, Download, Upload, FolderSync, Sparkles, ChevronDown, Code2 } from 'lucide-react';
import { PostgresParser } from '@schemaflow/schema-parser';
import { DatabaseSchema, DatabaseTable } from '@schemaflow/schema-core';
import { PostgresExporter } from '@schemaflow/schema-exporter';
import { SchemaCanvas } from '../canvas/SchemaCanvas';
import { SqlEditor } from '../editor/SqlEditor';
import { ExportModal } from '../export/ExportModal';
import { ExportDropdown } from '../ui/ExportDropdown';
import { TableEditorModal } from '../editor/TableEditorModal';
import { ToastContainer, toastManager } from '../ui/Toast';

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
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  }
  return DEFAULT_SQL;
}

function getInitialDiagramName(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(DIAGRAM_NAME_KEY);
    if (saved) return saved;
  }
  return 'Untitled Diagram';
}

function getInitialCardinality(): Record<string, Cardinality> {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(CARDINALITY_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
  }
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

  // We can initialize the parser once
  const parser = useMemo(() => new PostgresParser(), []);
  const exporter = useMemo(() => new PostgresExporter(), []);

  // Persist SQL to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, sqlCode);
  }, [sqlCode]);

  useEffect(() => {
    localStorage.setItem(DIAGRAM_NAME_KEY, diagramName);
    document.title = diagramName ? `${diagramName} - DB Schema Visualizer` : 'Untitled - DB Schema Visualizer';
  }, [diagramName]);

  // Persist cardinality overrides
  useEffect(() => {
    localStorage.setItem(CARDINALITY_KEY, JSON.stringify(cardinalityMap));
  }, [cardinalityMap]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSqlCode(content);
      // Optional: Set diagram name from file name (removing .sql)
      setDiagramName(file.name.replace(/\.sql$/i, ''));
      toastManager.addToast(`Imported ${file.name} successfully!`, 'success');
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleSaveClick = () => {
    // Later this will hit our Postgres API
    toastManager.addToast('Diagram saved to local storage.', 'success');
  };

  const handleShareClick = () => {
    // Later this will generate a real DB url
    navigator.clipboard.writeText(window.location.href);
    toastManager.addToast('Shareable link copied to clipboard!', 'info');
  };

  const handleCardinalityChange = useCallback((edgeId: string, cardinality: Cardinality) => {
    setCardinalityMap(prev => ({ ...prev, [edgeId]: cardinality }));
  }, []);

  // Parse SQL on change
  useEffect(() => {
    let isMounted = true;
    
    const parseSql = async () => {
      try {
        const parsed = await parser.parse(sqlCode);
        if (isMounted) {
          setSchema(parsed);
          setParseError(null);
        }
      } catch (e: any) {
        if (isMounted) {
          setParseError(e.message || 'Syntax error in SQL');
        }
      }
    };

    parseSql();

    return () => {
      isMounted = false;
    };
  }, [sqlCode, parser]);

  const handleTableSave = useCallback((updatedTable: DatabaseTable) => {
    if (!schema) return;

    // Update the tables array
    const updatedTables = schema.tables.map(t => t.name === editingTableId ? updatedTable : t);

    // Rebuild ALL relationships from every table's foreignKeys
    const relationships = updatedTables.flatMap(table =>
      (table.foreignKeys || []).map(fk => ({
        id: fk.id,
        sourceTable: table.name,
        sourceColumns: fk.columns,
        targetTable: fk.referencedTable,
        targetColumns: fk.referencedColumns,
        cardinality: 'one-to-many' as const,
      }))
    );

    const updatedSchema: DatabaseSchema = {
      ...schema,
      tables: updatedTables,
      relationships,
    };

    // Regenerate SQL
    const newSql = exporter.export(updatedSchema);
    
    // Update Editor and clear modal state
    setSqlCode(newSql);
    setEditingTableId(null);
  }, [schema, editingTableId, exporter]);

  const handleAddTable = useCallback(() => {
    // Generate a unique table name
    const existingNames = schema?.tables.map(t => t.name) || [];
    let newName = 'new_table';
    let counter = 1;
    while (existingNames.includes(newName)) {
      newName = `new_table_${counter}`;
      counter++;
    }

    // Append a new CREATE TABLE to the SQL
    const newTableSql = `\n\nCREATE TABLE ${newName} (\n  id UUID PRIMARY KEY\n);\n`;
    setSqlCode(prev => prev + newTableSql);

    // Open the editor modal for the new table after the parse completes
    setTimeout(() => {
      setEditingTableId(newName);
    }, 300);
  }, [schema]);

  return (
    <div className="w-full h-screen relative bg-slate-950 overflow-hidden font-sans flex flex-col">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      {/* Glassmorphism Header */}
      <header className="relative z-50 h-14 shrink-0 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-4">
        
        {/* Left side: Workspace & Diagram Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-md px-2.5 py-1.5 cursor-pointer">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
              <FolderSync className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-200">Personal</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          <span className="text-slate-600">/</span>

          <div className="flex items-center gap-2 bg-white/5 rounded-md px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-indigo-500/50">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <input 
              type="text" 
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-300 focus:outline-none w-48 placeholder:text-slate-500"
              placeholder="Untitled Diagram"
            />
          </div>
        </div>

        {/* Middle: AI Toggle (Placeholder) */}
        <div className="flex items-center gap-2 bg-white/5 rounded-md px-3 py-1.5">
          <Sparkles className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-sm font-medium text-slate-300">AI</span>
          <div className="w-8 h-4 rounded-full bg-slate-700 relative cursor-pointer ml-1">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-400 absolute left-0.5 top-0.5"></div>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">
          <button onClick={handleSaveClick} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-md transition-colors">
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <button onClick={handleShareClick} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-md transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
            <ChevronDown className="w-3 h-3 opacity-50 ml-0.5" />
          </button>
          
          <ExportDropdown onExportPostgres={() => setIsExporting(true)} diagramName={diagramName} />

        </div>
      </header>

      {/* Hidden File Input for Import */}
      <input 
        type="file" 
        accept=".sql"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex relative z-10 overflow-hidden">
        {/* Editor Sidebar */}
        <div 
          className={`transition-all duration-500 ease-in-out flex-shrink-0 ${
            isEditorOpen 
              ? isEditorFullScreen 
                ? 'w-full opacity-100' 
                : 'w-[450px] opacity-100' 
              : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          <SqlEditor 
            value={sqlCode} 
            onChange={(val) => setSqlCode(val || '')} 
            error={parseError} 
            onClose={() => {
              setIsEditorOpen(false);
              if (isEditorFullScreen) setIsEditorFullScreen(false);
            }}
            onToggleFullScreen={() => setIsEditorFullScreen(!isEditorFullScreen)}
            isFullScreen={isEditorFullScreen}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-slate-950/50">
          {!isEditorOpen && (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-lg hover:shadow-indigo-500/20 group flex items-center justify-center"
              title="Open Schema Editor"
            >
              <Code2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {schema ? (
            <SchemaCanvas
              schema={schema}
              onEditTable={setEditingTableId}
              onAddTable={handleAddTable}
              cardinalityMap={cardinalityMap}
              onCardinalityChange={handleCardinalityChange}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              Parsing schema...
            </div>
          )}
        </div>
      </div>

      {isExporting && schema && (
        <ExportModal schema={schema} onClose={() => setIsExporting(false)} />
      )}

      {editingTableId && schema && (
        <TableEditorModal 
          table={schema.tables.find(t => t.name === editingTableId)!}
          allTableNames={schema.tables.map(t => t.name)}
          onSave={handleTableSave}
          onClose={() => setEditingTableId(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
}
