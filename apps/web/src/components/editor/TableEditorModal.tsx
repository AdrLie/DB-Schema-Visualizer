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
      <div className="absolute inset-0" style={{ background: 'rgba(42,61,24,0.3)', backdropFilter: 'blur(8px)' }} onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 mb-0 sm:mb-4 flex flex-col max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(145deg,#ffffff 0%,#f5faea 100%)', border: '1px solid rgba(113,131,85,0.15)', boxShadow: '0 0 0 1px rgba(113,131,85,0.06), 0 40px 80px rgba(42,61,24,0.2), inset 0 1px 0 rgba(255,255,255,0.9)' }}>

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-600/40 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(181,201,154,0.15)', filter: 'blur(40px)' }} />

        {/* Header */}
        <div className="relative flex items-center justify-between px-7 pt-7 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg,#87986a,#718355)', boxShadow: '0 4px 12px rgba(113,131,85,0.3)' }}>
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5" style={{ color: 'rgba(74,96,48,0.5)' }}>Table Schema</p>
              <input type="text" value={tableName} onChange={e => setTableName(e.target.value)}
                className="text-xl font-bold bg-transparent border-none outline-none transition-colors w-auto"
                style={{ color: '#2a3d18', minWidth: '4ch', width: `${tableName.length + 1}ch` }}
                onFocus={e => (e.currentTarget as HTMLElement).style.color = '#718355'}
                onBlur={e => (e.currentTarget as HTMLElement).style.color = '#2a3d18'} />
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ color: 'rgba(74,96,48,0.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4a6030'; (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Column list header */}
        <div className="grid gap-3 px-7 py-2" style={{ gridTemplateColumns: '32px 1fr 120px 160px 80px 32px', borderBottom: '1px solid rgba(113,131,85,0.1)' }}>
          <div />
          {['Column name', 'Type', 'References', 'NN'].map((h, i) => (
            <span key={h} className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${i === 3 ? 'text-center' : ''}`} style={{ color: 'rgba(74,96,48,0.4)' }}>{h}</span>
          ))}
          <div />
        </div>

        {/* Columns */}
        <div className="flex-1 overflow-y-auto px-7 py-4 space-y-2">
          {columns.map((col, i) => (
            <div key={col.id}
              className="group grid gap-3 items-center rounded-2xl px-4 py-3 transition-all duration-200"
              style={{ gridTemplateColumns: '32px 1fr 120px 160px 80px 32px', background: i % 2 === 0 ? 'rgba(113,131,85,0.04)' : 'transparent', border: '1px solid transparent' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(113,131,85,0.1)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'transparent'}>

              {/* PK toggle */}
              <button onClick={() => updateCol(col.id, { isPrimaryKey: !col.isPrimaryKey })}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ background: col.isPrimaryKey ? 'rgba(113,131,85,0.15)' : 'transparent', color: col.isPrimaryKey ? '#718355' : 'rgba(74,96,48,0.3)', boxShadow: col.isPrimaryKey ? '0 0 8px rgba(113,131,85,0.2)' : 'none' }}
                onMouseEnter={e => { if (!col.isPrimaryKey) { (e.currentTarget as HTMLElement).style.color = '#87986a'; (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.08)'; } }}
                onMouseLeave={e => { if (!col.isPrimaryKey) { (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                title="Toggle Primary Key">
                <KeyRound className="w-3.5 h-3.5" />
              </button>

              {/* Name */}
              <input type="text" value={col.name} onChange={e => updateCol(col.id, { name: e.target.value })}
                className="w-full bg-transparent text-sm font-medium focus:outline-none pb-0.5 transition-all"
                style={{ color: '#2a3d18', borderBottom: '1px solid transparent' }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderBottomColor = 'rgba(113,131,85,0.4)'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'}
                placeholder="column_name" />

              <CustomDropdown value={col.type.toUpperCase()} options={TYPE_OPTIONS} onChange={val => updateCol(col.id, { type: val })} />
              <CustomDropdown value={col.referencesTable || ''} options={refDropdownOptions} onChange={val => updateCol(col.id, { referencesTable: val || undefined })} placeholder="None" activeColor="text-green-700" />

              {/* Not Null toggle */}
              <div className="flex justify-center">
                <button onClick={() => updateCol(col.id, { nullable: !col.nullable })}
                  className="w-8 h-5 rounded-full transition-all duration-300 relative"
                  style={{ background: !col.nullable ? '#87986a' : 'rgba(113,131,85,0.2)' }}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${!col.nullable ? 'left-3.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Delete */}
              <button onClick={() => removeCol(col.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                style={{ color: 'rgba(196,92,58,0.5)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c45c3a'; (e.currentTarget as HTMLElement).style.background = 'rgba(196,92,58,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(196,92,58,0.5)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add column */}
          <button onClick={addCol}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all duration-200 border border-dashed"
            style={{ color: 'rgba(74,96,48,0.45)', borderColor: 'rgba(113,131,85,0.2)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#4a6030'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(113,131,85,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.45)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(113,131,85,0.2)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <Plus className="w-4 h-4" /> Add Column
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-5" style={{ borderTop: '1px solid rgba(113,131,85,0.1)', background: 'rgba(238,245,224,0.5)' }}>
          <p className="text-xs" style={{ color: 'rgba(74,96,48,0.4)' }}>
            {columns.length} column{columns.length !== 1 ? 's' : ''}
            {columns.filter(c => c.referencesTable).length > 0 && ` · ${columns.filter(c => c.referencesTable).length} FK`}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium rounded-xl transition-colors"
              style={{ color: 'rgba(74,96,48,0.5)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#4a6030'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.5)'}>
              Discard
            </button>
            <button onClick={handleSave}
              className="px-6 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#87986a,#718355)', boxShadow: '0 4px 16px rgba(113,131,85,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
