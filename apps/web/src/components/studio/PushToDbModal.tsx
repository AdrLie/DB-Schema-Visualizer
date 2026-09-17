import { useState } from 'react';
import { Database, Loader2, AlertCircle, PlayCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { CustomDropdown } from '../ui/CustomDropdown';

interface PushToDbModalProps {
  onClose: () => void;
  sqlCode: string;
  initialCredentials?: any;
}

const DB_OPTIONS = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
];

export function PushToDbModal({ onClose, sqlCode, initialCredentials }: PushToDbModalProps) {
  const [type, setType] = useState<'postgresql' | 'mysql'>(initialCredentials?.type || 'postgresql');
  const [host, setHost] = useState(initialCredentials?.host || 'localhost');
  const [port, setPort] = useState(initialCredentials?.port?.toString() || '5432');
  const [database, setDatabase] = useState(initialCredentials?.database || '');
  const [user, setUser] = useState(initialCredentials?.user || 'postgres');
  const [password, setPassword] = useState(initialCredentials?.password || '');
  const [ssl, setSsl] = useState(initialCredentials?.ssl || false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePush = async () => {
    setLoading(true);
    setError(null);
    try {
      const credentials = { type, host, port: parseInt(port, 10), database, user, password, ssl };
      const res = await fetch('http://localhost:4001/db-connector/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, sql: sqlCode }),
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Execution failed');
      }
      
      // Success
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType as 'postgresql' | 'mysql');
    if (newType === 'mysql' && port === '5432') setPort('3306');
    if (newType === 'postgresql' && port === '3306') setPort('5432');
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-md">
      <div className="relative z-10 px-6 pt-6 pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-1" style={{ color: '#2a3d18' }}>
          <PlayCircle className="w-5 h-5 text-red-600" />
          Push to Database
        </h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(74,96,48,0.6)' }}>
          Execute the current SQL schema directly onto a live database. <strong>Warning:</strong> This is a destructive operation.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(74,96,48,0.7)' }}>Database Type</label>
            <CustomDropdown
              value={type}
              options={DB_OPTIONS}
              onChange={handleTypeChange}
              activeColor="#718355"
              className="w-full"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(74,96,48,0.7)' }}>Host</label>
              <input type="text" value={host} onChange={e => setHost(e.target.value)} 
                className="w-full px-3 py-2 text-sm rounded-lg transition-all focus:outline-none" 
                style={{ background: 'rgba(113,131,85,0.04)', border: '1px solid rgba(113,131,85,0.15)', color: '#2a3d18' }}
                onFocus={e => e.target.style.borderColor = 'rgba(113,131,85,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(113,131,85,0.15)'}
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(74,96,48,0.7)' }}>Port</label>
              <input type="number" value={port} onChange={e => setPort(e.target.value)} 
                className="w-full px-3 py-2 text-sm rounded-lg transition-all focus:outline-none" 
                style={{ background: 'rgba(113,131,85,0.04)', border: '1px solid rgba(113,131,85,0.15)', color: '#2a3d18' }}
                onFocus={e => e.target.style.borderColor = 'rgba(113,131,85,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(113,131,85,0.15)'}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(74,96,48,0.7)' }}>Database Name</label>
            <input type="text" value={database} onChange={e => setDatabase(e.target.value)} placeholder="e.g. my_database"
              className="w-full px-3 py-2 text-sm rounded-lg transition-all focus:outline-none placeholder:opacity-40" 
              style={{ background: 'rgba(113,131,85,0.04)', border: '1px solid rgba(113,131,85,0.15)', color: '#2a3d18' }}
              onFocus={e => e.target.style.borderColor = 'rgba(113,131,85,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(113,131,85,0.15)'}
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(74,96,48,0.7)' }}>Username</label>
              <input type="text" value={user} onChange={e => setUser(e.target.value)} 
                className="w-full px-3 py-2 text-sm rounded-lg transition-all focus:outline-none" 
                style={{ background: 'rgba(113,131,85,0.04)', border: '1px solid rgba(113,131,85,0.15)', color: '#2a3d18' }}
                onFocus={e => e.target.style.borderColor = 'rgba(113,131,85,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(113,131,85,0.15)'}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(74,96,48,0.7)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-3 py-2 text-sm rounded-lg transition-all focus:outline-none placeholder:opacity-40" 
                style={{ background: 'rgba(113,131,85,0.04)', border: '1px solid rgba(113,131,85,0.15)', color: '#2a3d18' }}
                onFocus={e => e.target.style.borderColor = 'rgba(113,131,85,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(113,131,85,0.15)'}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm rounded-lg flex gap-2 items-start animate-in fade-in slide-in-from-top-1" style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="leading-tight">{error}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-6 py-4 flex justify-end items-center relative z-10" style={{ background: 'rgba(113,131,85,0.03)', borderTop: '1px solid rgba(113,131,85,0.1)' }}>
        <button 
          onClick={handlePush}
          disabled={loading || !database}
          className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm bg-red-600 hover:bg-red-700"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          Execute SQL
        </button>
      </div>
    </Modal>
  );
}
