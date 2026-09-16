import Editor from '@monaco-editor/react';
import { Maximize2, Minimize2, X, Code2 } from 'lucide-react';

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
    <div className="w-full h-full flex flex-col relative z-20"
      style={{ background: '#160c05', borderRight: '1px solid rgba(176,137,104,0.1)' }}>
      {/* Toolbar */}
      <div className="h-11 shrink-0 flex items-center justify-between px-4"
        style={{ background: 'rgba(24,13,6,0.95)', borderBottom: '1px solid rgba(176,137,104,0.1)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5" style={{ color: '#b08968' }} />
          <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(176,137,104,0.6)' }}>Schema Editor</h2>
        </div>
        <div className="flex items-center gap-1">
          {onToggleFullScreen && <EBtn onClick={onToggleFullScreen} title={isFullScreen ? 'Minimize' : 'Full Screen'}>{isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}</EBtn>}
          {onClose && <EBtn onClick={onClose} title="Close"><X className="w-3.5 h-3.5" /></EBtn>}
        </div>
      </div>

      {/* Monaco */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 22,
            fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
            fontLigatures: true,
            padding: { top: 14, bottom: 14 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'gutter',
            overviewRulerLanes: 0,
            scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
          }}
          beforeMount={monaco => {
            // Override vs-dark background with warm dark
            monaco.editor.defineTheme('autumn-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'keyword', foreground: 'ddb892', fontStyle: 'bold' },
                { token: 'string', foreground: 'e6ccb2' },
                { token: 'comment', foreground: '7f5539', fontStyle: 'italic' },
                { token: 'number', foreground: 'b08968' },
                { token: 'identifier', foreground: 'ede0d4' },
                { token: 'type', foreground: '9c6644' },
              ],
              colors: {
                'editor.background': '#160c05',
                'editor.foreground': '#ede0d4',
                'editor.lineHighlightBackground': '#1c1009',
                'editor.selectionBackground': '#7f553940',
                'editorCursor.foreground': '#ddb892',
                'editorLineNumber.foreground': '#4a2e18',
                'editorLineNumber.activeForeground': '#b08968',
                'editor.inactiveSelectionBackground': '#7f553920',
                'scrollbarSlider.background': '#7f553930',
                'scrollbarSlider.hoverBackground': '#7f553950',
                'scrollbarSlider.activeBackground': '#7f553970',
              },
            });
          }}
          onMount={(editor, monaco) => {
            monaco.editor.setTheme('autumn-dark');
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="shrink-0 p-3 overflow-y-auto max-h-28"
          style={{ borderTop: '1px solid rgba(159,85,57,0.3)', background: 'rgba(30,8,4,0.9)' }}>
          <p className="text-[10px] font-bold mb-1 uppercase tracking-widest" style={{ color: '#9c6644' }}>Parse Error</p>
          <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: 'rgba(176,137,104,0.7)' }}>{error}</pre>
        </div>
      )}
    </div>
  );
}

function EBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
      style={{ color: 'rgba(176,137,104,0.5)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(176,137,104,0.1)'; (e.currentTarget as HTMLElement).style.color = '#ddb892'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(176,137,104,0.5)'; }}>
      {children}
    </button>
  );
}
