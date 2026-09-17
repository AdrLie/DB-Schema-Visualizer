import Editor, { OnMount } from '@monaco-editor/react';
import { Maximize2, Minimize2, X, Code2, AlertTriangle } from 'lucide-react';
import { useRef, useEffect } from 'react';
import type * as Monaco from 'monaco-editor';

interface SqlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  error?: string | null;
  onClose?: () => void;
  onToggleFullScreen?: () => void;
  isFullScreen?: boolean;
}

/** Try to extract line/col from common parser error messages, e.g. "line 3, col 5" or "(3:5)" */
function parseErrorLocation(msg: string): { line: number; col: number } | null {
  const patterns = [
    /line[: ]+(\d+)[,\s]+col(?:umn)?[: ]+(\d+)/i,
    /\((\d+):(\d+)\)/,
    /at line (\d+)/i,
    /line (\d+)/i,
  ];
  for (const re of patterns) {
    const m = msg.match(re);
    if (m) return { line: parseInt(m[1]), col: parseInt(m[2] ?? '1') };
  }
  return null;
}

export function SqlEditor({ value, onChange, error, onClose, onToggleFullScreen, isFullScreen }: SqlEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);

  // Apply / clear error markers whenever the error prop changes
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    if (!error) {
      monaco.editor.setModelMarkers(model, 'sql-parser', []);
      return;
    }

    const loc = parseErrorLocation(error);
    const lineCount = model.getLineCount();
    const line = loc ? Math.min(Math.max(loc.line, 1), lineCount) : 1;
    const col = loc?.col ?? 1;
    const lineLen = model.getLineLength(line);

    monaco.editor.setModelMarkers(model, 'sql-parser', [
      {
        severity: monaco.MarkerSeverity.Error,
        message: error,
        startLineNumber: line,
        startColumn: col,
        endLineNumber: line,
        endColumn: lineLen > 0 ? lineLen + 1 : col + 1,
      },
    ]);

    // Reveal the error line in the editor
    editor.revealLineInCenter(line);
  }, [error]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.setTheme('earthy-green-light');
  };

  return (
    <div className="w-full h-full flex flex-col relative z-20"
      style={{ background: '#ffffff', borderRight: '1px solid rgba(113,131,85,0.15)' }}>

      {/* Toolbar */}
      <div className="h-11 shrink-0 flex items-center justify-between px-4"
        style={{ background: 'rgba(233,245,219,0.8)', borderBottom: '1px solid rgba(113,131,85,0.12)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5" style={{ color: '#87986a' }} />
          <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(74,96,48,0.7)' }}>Schema Editor</h2>
          {/* Error badge in toolbar */}
          {error && (
            <span className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold animate-in fade-in"
              style={{ background: 'rgba(196,92,58,0.12)', color: '#c45c3a', border: '1px solid rgba(196,92,58,0.2)' }}>
              <AlertTriangle className="w-2.5 h-2.5" />
              Error
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onToggleFullScreen && <EBtn onClick={onToggleFullScreen} title={isFullScreen ? 'Minimize' : 'Full Screen'}>{isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}</EBtn>}
          {onClose && <EBtn onClick={onClose} title="Close"><X className="w-3.5 h-3.5" /></EBtn>}
        </div>
      </div>

      {/* Monaco */}
      <div className="flex-1 relative overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={value}
          onChange={onChange}
          onMount={handleMount}
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
            overviewRulerLanes: 3,
            scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
            // Show errors in the gutter
            glyphMargin: true,
            folding: true,
          }}
          beforeMount={monaco => {
            monaco.editor.defineTheme('earthy-green-light', {
              base: 'vs',
              inherit: true,
              rules: [
                { token: 'keyword',    foreground: '718355', fontStyle: 'bold' },
                { token: 'string',     foreground: '4a6030' },
                { token: 'comment',    foreground: '97a97c', fontStyle: 'italic' },
                { token: 'number',     foreground: '87986a' },
                { token: 'identifier', foreground: '2a3d18' },
                { token: 'type',       foreground: '87986a' },
              ],
              colors: {
                'editor.background':                  '#ffffff',
                'editor.foreground':                  '#2a3d18',
                'editor.lineHighlightBackground':     '#f5fdf0',
                'editor.selectionBackground':         '#b5c99a55',
                'editorCursor.foreground':            '#718355',
                'editorLineNumber.foreground':        '#c4d9a8',
                'editorLineNumber.activeForeground':  '#718355',
                'editor.inactiveSelectionBackground': '#b5c99a25',
                'scrollbarSlider.background':         '#97a97c28',
                'scrollbarSlider.hoverBackground':    '#97a97c48',
                'scrollbarSlider.activeBackground':   '#97a97c68',
                'editorWidget.background':            '#f0f8e4',
                'editorWidget.border':                '#b5c99a',
                // Error decoration colours (squiggly + gutter)
                'editorError.foreground':             '#c45c3a',
                'editorError.border':                 '#c45c3a',
                'editorGutter.background':            '#fafaf7',
                'editorOverviewRuler.errorForeground': '#c45c3a',
              },
            });
          }}
        />
      </div>

      {/* Error panel */}
      {error && (
        <div className="shrink-0 overflow-hidden animate-in slide-in-from-bottom-2 duration-200"
          style={{ borderTop: '2px solid rgba(196,92,58,0.35)', background: 'rgba(255,248,245,0.98)', maxHeight: 120 }}>
          <div className="flex items-start gap-2.5 px-4 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#c45c3a' }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#c45c3a' }}>Parse Error</p>
              <pre className="text-[11px] font-mono whitespace-pre-wrap overflow-y-auto leading-relaxed"
                style={{ color: 'rgba(120,60,40,0.85)', maxHeight: 72 }}>{error}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
      style={{ color: 'rgba(74,96,48,0.5)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(113,131,85,0.12)'; (e.currentTarget as HTMLElement).style.color = '#4a6030'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(74,96,48,0.5)'; }}>
      {children}
    </button>
  );
}
