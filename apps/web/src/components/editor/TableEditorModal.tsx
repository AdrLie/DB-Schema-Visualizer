'use client';
import { useState } from 'react';
import { DatabaseTable, DatabaseColumn, DatabaseForeignKey } from '@schemaflow/schema-core';
import { X, Plus, Trash2, KeyRound, Link } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CustomDropdown } from '../ui/CustomDropdown';

interface TableEditorModalProps { table: DatabaseTable; allTableNames: string[]; onSave: (t: DatabaseTable) => void; onClose: () => void; }
interface ColumnWithRef extends DatabaseColumn { referencesTable?: string; }

const TYPE_OPTIONS = ['UUID','VARCHAR','TEXT','INT','BIGINT','DECIMAL','BOOLEAN','TIMESTAMP','DATE'].map(v => ({ value: v, label: v }));

export function TableEditorModal({ table, allTableNames, onSave, onClose }: TableEditorModalProps) {
  const [tableName, setTableName] = useState(table.name);
  const [columns, setColumns] = useState<ColumnWithRef[]>(
    table.columns.map(col => {
      const fk = table.foreignKeys?.find(fk => fk.columns.length === 1 && fk.columns[0] === col.name);
      return { ...col, referencesTable: fk?.referencedTable };
    })
  );

  const addCol = () => setColumns(p => [...p, { id: uuidv4(), name: 'new_column', type: 'VARCHAR', nullable: true, isPrimaryKey: false }]);
  const removeCol = (id: string) => setColumns(p => p.filter(c => c.id !== id));
  const updateCol = (id: string, u: Partial<ColumnWithRef>) => setColumns(p => p.map(c => {
    if (c.id === id) return { ...c, ...u };
    if (u.isPrimaryKey) return { ...c, isPrimaryKey: false };
    return c;
  }));

  const handleSave = () => {
    const foreignKeys: DatabaseForeignKey[] = columns.filter(c => c.referencesTable).map(c => ({ id: uuidv4(), columns: [c.name], referencedTable: c.referencesTable!, referencedColumns: ['id'] }));
    onSave({ ...table, name: tableName, columns: columns.map(({ referencesTable, ...c }) => c), primaryKey: columns.some(c => c.isPrimaryKey) ? { columns: [columns.find(c => c.isPrimaryKey)!.name] } : undefined, foreignKeys });
  };

  const refDropdownOptions = [{ value: '', label: 'None' }, ...allTableNames.filter(n => n !== tableName).map(n => ({ value: n, label: n }))];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 mb-0 sm:mb-4 flex flex-col max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(145deg,#1c1009 0%,#120a05 100%)', border: '1px solid rgba(176,137,104,0.12)', boxShadow: '0 0 0 1px rgba(176,137,104,0.07), 0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(221,184,146,0.06)' }}>

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-800/50 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(176,137,104,0.04)', filter: 'blur(40px)' }} />

        {/* Header */}
        <div className="relative flex items-center justify-between px-7 pt-7 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg,#9c6644,#7f5539)', boxShadow: '0 0 20px rgba(127,85,57,0.3)' }}>
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5" style={{ color: 'rgba(176,137,104,0.4)' }}>Table Schema</p>
              <input type="text" value={tableName} onChange={e => setTableName(e.target.value)}
                className="text-xl font-bold bg-transparent border-none outline-none transition-colors w-auto"
                style={{ color: '#ede0d4', minWidth: '4ch', width: `${tableName.length + 1}ch` }}
                onFocus={e => (e.currentTarget as HTMLElement).style.color = '#ddb892'}
                onBlur={e => (e.currentTarget as HTMLElement).style.color = '#ede0d4'} />
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ color: 'rgba(176,137,104,0.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ddb892'; (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Column list header */}
        <div className="grid gap-3 px-7 py-2" style={{ gridTemplateColumns: '32px 1fr 120px 160px 80px 32px', borderBottom: '1px solid rgba(176,137,104,0.07)' }}>
          <div />
          {['Column name', 'Type', 'References', 'NN'].map((h, i) => (
            <span key={h} className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${i === 3 ? 'text-center' : ''}`} style={{ color: 'rgba(176,137,104,0.35)' }}>{h}</span>
          ))}
          <div />
        </div>

        {/* Columns */}
        <div className="flex-1 overflow-y-auto px-7 py-4 space-y-2">
          {columns.map((col, i) => (
            <div key={col.id}
              className="group grid gap-3 items-center rounded-2xl px-4 py-3 transition-all duration-200"
              style={{ gridTemplateColumns: '32px 1fr 120px 160px 80px 32px', background: i % 2 === 0 ? 'rgba(176,137,104,0.03)' : 'transparent', border: '1px solid transparent' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'transparent'}>

              {/* PK toggle */}
              <button onClick={() => updateCol(col.id, { isPrimaryKey: !col.isPrimaryKey })}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ background: col.isPrimaryKey ? 'rgba(221,184,146,0.12)' : 'transparent', color: col.isPrimaryKey ? '#ddb892' : 'rgba(176,137,104,0.3)', boxShadow: col.isPrimaryKey ? '0 0 12px rgba(221,184,146,0.15)' : 'none' }}
                onMouseEnter={e => { if (!col.isPrimaryKey) { (e.currentTarget as HTMLElement).style.color = '#b08968'; (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.07)'; } }}
                onMouseLeave={e => { if (!col.isPrimaryKey) { (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                title="Toggle Primary Key">
                <KeyRound className="w-3.5 h-3.5" />
              </button>

              {/* Name */}
              <input type="text" value={col.name} onChange={e => updateCol(col.id, { name: e.target.value })}
                className="w-full bg-transparent text-sm font-medium focus:outline-none pb-0.5 transition-all"
                style={{ color: '#e6ccb2', borderBottom: '1px solid transparent' }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderBottomColor = 'rgba(176,137,104,0.4)'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'}
                placeholder="column_name" />

              <CustomDropdown value={col.type.toUpperCase()} options={TYPE_OPTIONS} onChange={val => updateCol(col.id, { type: val })} />
              <CustomDropdown value={col.referencesTable || ''} options={refDropdownOptions} onChange={val => updateCol(col.id, { referencesTable: val || undefined })} placeholder="None" activeColor="text-amber-400" />

              {/* Not Null toggle */}
              <div className="flex justify-center">
                <button onClick={() => updateCol(col.id, { nullable: !col.nullable })}
                  className="w-8 h-5 rounded-full transition-all duration-300 relative"
                  style={{ background: !col.nullable ? '#9c6644' : 'rgba(176,137,104,0.15)' }}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${!col.nullable ? 'left-3.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Delete */}
              <button onClick={() => removeCol(col.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                style={{ color: 'rgba(176,137,104,0.4)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e6ccb2'; (e.currentTarget as HTMLElement).style.background = 'rgba(127,85,57,0.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add column */}
          <button onClick={addCol}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all duration-200 border border-dashed"
            style={{ color: 'rgba(176,137,104,0.4)', borderColor: 'rgba(176,137,104,0.12)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#b08968'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,137,104,0.12)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <Plus className="w-4 h-4" /> Add Column
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-5" style={{ borderTop: '1px solid rgba(176,137,104,0.07)', background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-xs" style={{ color: 'rgba(176,137,104,0.35)' }}>
            {columns.length} column{columns.length !== 1 ? 's' : ''}
            {columns.filter(c => c.referencesTable).length > 0 && ` · ${columns.filter(c => c.referencesTable).length} FK`}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium rounded-xl transition-colors"
              style={{ color: 'rgba(176,137,104,0.45)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ddb892'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.45)'}>
              Discard
            </button>
            <button onClick={handleSave}
              className="px-6 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#9c6644,#7f5539)', boxShadow: '0 0 20px rgba(127,85,57,0.35), inset 0 1px 0 rgba(255,255,255,0.12)' }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
