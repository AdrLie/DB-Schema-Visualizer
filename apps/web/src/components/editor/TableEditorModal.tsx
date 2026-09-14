'use client';
import { useState } from 'react';
import { DatabaseTable, DatabaseColumn, DatabaseForeignKey } from '@schemaflow/schema-core';
import { X, Plus, Trash2, KeyRound, Link } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CustomDropdown } from '../ui/CustomDropdown';

interface TableEditorModalProps {
  table: DatabaseTable;
  allTableNames: string[];
  onSave: (updatedTable: DatabaseTable) => void;
  onClose: () => void;
}

interface ColumnWithRef extends DatabaseColumn {
  referencesTable?: string;
}

const TYPE_OPTIONS = [
  { value: 'UUID', label: 'UUID' },
  { value: 'VARCHAR', label: 'VARCHAR' },
  { value: 'TEXT', label: 'TEXT' },
  { value: 'INT', label: 'INT' },
  { value: 'BIGINT', label: 'BIGINT' },
  { value: 'DECIMAL', label: 'DECIMAL' },
  { value: 'BOOLEAN', label: 'BOOLEAN' },
  { value: 'TIMESTAMP', label: 'TIMESTAMP' },
  { value: 'DATE', label: 'DATE' },
];

export function TableEditorModal({ table, allTableNames, onSave, onClose }: TableEditorModalProps) {
  const [tableName, setTableName] = useState(table.name);

  const initialColumns: ColumnWithRef[] = table.columns.map(col => {
    const fk = table.foreignKeys?.find(fk => fk.columns.length === 1 && fk.columns[0] === col.name);
    return { ...col, referencesTable: fk?.referencedTable || undefined };
  });

  const [columns, setColumns] = useState<ColumnWithRef[]>(initialColumns);

  const handleAddColumn = () => {
    setColumns([...columns, {
      id: uuidv4(),
      name: 'new_column',
      type: 'VARCHAR',
      nullable: true,
      isPrimaryKey: false,
    }]);
  };

  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
  };

  const handleUpdateColumn = (id: string, updates: Partial<ColumnWithRef>) => {
    setColumns(columns.map(c => {
      if (c.id === id) return { ...c, ...updates };
      if (updates.isPrimaryKey) return { ...c, isPrimaryKey: false };
      return c;
    }));
  };

  const handleSave = () => {
    const foreignKeys: DatabaseForeignKey[] = columns
      .filter(col => col.referencesTable)
      .map(col => ({
        id: uuidv4(),
        columns: [col.name],
        referencedTable: col.referencesTable!,
        referencedColumns: ['id'],
      }));

    const updatedTable: DatabaseTable = {
      ...table,
      name: tableName,
      columns: columns.map(({ referencesTable, ...col }) => col),
      primaryKey: columns.some(c => c.isPrimaryKey)
        ? { columns: [columns.find(c => c.isPrimaryKey)!.name] }
        : undefined,
      foreignKeys,
    };
    onSave(updatedTable);
  };

  const refOptions = allTableNames.filter(n => n !== tableName);
  const refDropdownOptions = [
    { value: '', label: 'None' },
    ...refOptions.map(n => ({ value: n, label: n })),
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 mb-0 sm:mb-4 flex flex-col max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(15,18,35,0.98) 0%, rgba(10,12,28,0.99) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Ambient glow at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-7 pt-7 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mb-0.5">Table Schema</p>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="text-xl font-bold text-white bg-transparent border-none outline-none focus:text-indigo-300 transition-colors w-auto"
                style={{ minWidth: '4ch', width: `${tableName.length + 1}ch` }}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Column list header */}
        <div className="grid gap-3 px-7 py-2 border-b border-white/[0.04]"
          style={{ gridTemplateColumns: '32px 1fr 120px 160px 80px 32px' }}>
          <div />
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em]">Column name</span>
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em]">Type</span>
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em]">References</span>
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em] text-center">NN</span>
          <div />
        </div>

        {/* Columns */}
        <div className="flex-1 overflow-y-auto px-7 py-4 space-y-2">
          {columns.map((col, i) => (
            <div
              key={col.id}
              className="group grid gap-3 items-center rounded-2xl px-4 py-3 transition-all duration-200 hover:bg-white/[0.025]"
              style={{
                gridTemplateColumns: '32px 1fr 120px 160px 80px 32px',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
            >
              {/* PK toggle */}
              <button
                onClick={() => handleUpdateColumn(col.id, { isPrimaryKey: !col.isPrimaryKey })}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  col.isPrimaryKey
                    ? 'bg-amber-500/15 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'text-slate-700 hover:text-slate-400 hover:bg-white/5'
                }`}
                title="Toggle Primary Key"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>

              {/* Name */}
              <input
                type="text"
                value={col.name}
                onChange={(e) => handleUpdateColumn(col.id, { name: e.target.value })}
                className="w-full bg-transparent text-sm font-medium text-slate-200 placeholder:text-slate-700 focus:outline-none focus:text-white border-b border-transparent focus:border-indigo-500/50 pb-0.5 transition-all"
                placeholder="column_name"
              />

              {/* Type */}
              <CustomDropdown
                value={col.type.toUpperCase()}
                options={TYPE_OPTIONS}
                onChange={(val) => handleUpdateColumn(col.id, { type: val })}
              />

              {/* References */}
              <CustomDropdown
                value={col.referencesTable || ''}
                options={refDropdownOptions}
                onChange={(val) => handleUpdateColumn(col.id, { referencesTable: val || undefined })}
                placeholder="None"
                activeColor="text-violet-400"
              />

              {/* Not Null toggle */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleUpdateColumn(col.id, { nullable: !col.nullable })}
                  className={`w-8 h-5 rounded-full transition-all duration-300 relative ${
                    !col.nullable ? 'bg-indigo-500' : 'bg-slate-800'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                    !col.nullable ? 'left-3.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleRemoveColumn(col.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-red-500/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add column button */}
          <button
            onClick={handleAddColumn}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-300 transition-all duration-200 border border-dashed border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
          >
            <Plus className="w-4 h-4" />
            Add Column
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-5 border-t border-white/[0.04]"
          style={{ background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-xs text-slate-600">
            {columns.length} column{columns.length !== 1 ? 's' : ''}
            {columns.filter(c => c.referencesTable).length > 0 && ` · ${columns.filter(c => c.referencesTable).length} FK`}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-200 rounded-xl transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 0 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
