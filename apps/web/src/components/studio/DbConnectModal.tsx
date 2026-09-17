import { useState } from 'react';
import { Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DatabaseSchema } from '@schemaflow/schema-core';
import { Modal } from '../ui/Modal';
import { CustomDropdown } from '../ui/CustomDropdown';

interface DbConnectModalProps {
  onClose: () => void;
  onSuccess: (schema: DatabaseSchema, credentials: any) => void;
}

const DB_OPTIONS = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
];

export function DbConnectModal({ onClose, onSuccess }: DbConnectModalProps) {
  const [type, setType] = useState<'postgresql' | 'mysql'>('postgresql');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('5432');
  const [database, setDatabase] = useState('');
  const [user, setUser] = useState('postgres');
  const [password, setPassword] = useState('');
  const [ssl, setSsl] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setTestSuccess(false);
    try {
      const res = await fetch('http://localhost:4001/db-connector/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, host, port: parseInt(port, 10), database, user, password, ssl }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Connection failed');
      }
      setTestSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const credentials = { type, host, port: parseInt(port, 10), database, user, password, ssl };
      const res = await fetch('http://localhost:4001/db-connector/introspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Introspection failed');
      }
      const schema: DatabaseSchema = await res.json();
      onSuccess(schema, credentials);
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
          <Database className="w-5 h-5" style={{ color: '#718355' }} />
          Connect to Database
        </h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(74,96,48,0.6)' }}>
          Import an existing schema directly from your database. Connections are stateless and not saved.
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
          
          <label className="flex items-center gap-2 cursor-pointer w-fit group">
            <div className="relative flex items-center justify-center w-4 h-4 rounded transition-colors"
              style={{ background: ssl ? '#718355' : 'transparent', border: ssl ? '1px solid #718355' : '1px solid rgba(113,131,85,0.3)' }}
            >
              <input type="checkbox" checked={ssl} onChange={e => setSsl(e.target.checked)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full m-0" />
              {ssl && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm font-medium transition-colors" style={{ color: 'rgba(74,96,48,0.8)' }}>Require SSL</span>
          </label>

          {error && (
            <div className="p-3 text-sm rounded-lg flex gap-2 items-start animate-in fade-in slide-in-from-top-1" style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="leading-tight">{error}</span>
            </div>
          )}
          {testSuccess && !error && (
            <div className="p-3 text-sm rounded-lg flex gap-2 items-center animate-in fade-in slide-in-from-top-1" style={{ background: 'rgba(113,131,85,0.1)', color: '#4a6030', border: '1px solid rgba(113,131,85,0.2)' }}>
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">Connection successful!</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-6 py-4 flex justify-between items-center relative z-10" style={{ background: 'rgba(113,131,85,0.03)', borderTop: '1px solid rgba(113,131,85,0.1)' }}>
        <button 
          onClick={handleTest} 
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
          style={{ color: '#4a6030', background: 'transparent' }}
          onMouseEnter={e => { if(!loading) e.currentTarget.style.background = 'rgba(113,131,85,0.08)' }}
          onMouseLeave={e => { if(!loading) e.currentTarget.style.background = 'transparent' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test Connection'}
        </button>
        
        <button 
          onClick={handleImport}
          disabled={loading || !database}
          className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
          style={{ background: '#718355' }}
          onMouseEnter={e => { if(!loading && database) e.currentTarget.style.background = '#5a6b42' }}
          onMouseLeave={e => { if(!loading && database) e.currentTarget.style.background = '#718355' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          Import Schema
        </button>
      </div>
    </Modal>
  );
}
