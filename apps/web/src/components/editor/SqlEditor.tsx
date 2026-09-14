import Editor from '@monaco-editor/react';
import { Maximize2, Minimize2, X } from 'lucide-react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  error?: string | null;
  onClose?: () => void;
  onToggleFullScreen?: () => void;
  isFullScreen?: boolean;
}

export function SqlEditor({ value, onChange, error, onClose, onToggleFullScreen, isFullScreen }: SqlEditorProps) {
  return (
    <div className="w-full h-full flex flex-col bg-slate-950 border-r border-white/10 relative z-20">
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-slate-900/50">
        <h2 className="text-sm font-semibold text-slate-300">Schema Editor</h2>
        <div className="flex items-center gap-2">
          {onToggleFullScreen && (
            <button 
              onClick={onToggleFullScreen}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title={isFullScreen ? "Minimize" : "Full Screen"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title="Close Editor"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
          }}
        />
      </div>

      {error && (
        <div className="h-32 border-t border-red-500/30 bg-red-950/50 p-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-red-400 mb-1">Parse Error</h3>
          <pre className="text-xs text-red-300/80 whitespace-pre-wrap font-mono">{error}</pre>
        </div>
      )}
    </div>
  );
}
