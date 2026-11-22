import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';

export interface LogEntry {
  id: number;
  kind: 'system' | 'command' | 'output' | 'error' | 'stream';
  text: string;
}

interface TerminalConsoleProps {
  logs: LogEntry[];
  terminated: boolean;
  onExecuteCommand: (rawCommand: string) => void;
  onRestart: () => void;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  logs,
  terminated,
  onExecuteCommand,
  onRestart,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (terminated) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setHistory((prev) => [trimmed, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    onExecuteCommand(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(nextIndex);
      setInputValue(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInputValue('');
      } else {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputValue(history[nextIndex]);
      }
    }
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/70 px-3.5 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
          <Terminal className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-mono">miniworld console</span>
        </div>
        <span className="font-mono text-[11px] text-zinc-500">
          Commands: w/a/s/d, map, status, look, save, load, help, q
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-1.5 overflow-y-auto p-3.5 font-mono text-xs leading-relaxed"
      >
        {logs.map((entry) => {
          let colorClass = 'text-zinc-300';
          if (entry.kind === 'command') colorClass = 'text-emerald-400 font-semibold';
          else if (entry.kind === 'error') colorClass = 'text-rose-400';
          else if (entry.kind === 'stream') colorClass = 'text-sky-300';
          else if (entry.kind === 'system') colorClass = 'text-zinc-400';

          return (
            <pre
              key={entry.id}
              className={`whitespace-pre-wrap break-words font-mono ${colorClass}`}
            >
              {entry.text}
            </pre>
          );
        })}
      </div>

      {terminated ? (
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5">
          <span className="font-mono text-xs text-zinc-400">
            Session ended (q). Restart engine to continue.
          </span>
          <button
            type="button"
            onClick={onRestart}
            className="rounded bg-emerald-600 px-3 py-1 font-mono text-xs font-medium text-white hover:bg-emerald-500"
          >
            Restart Session
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-zinc-800 bg-zinc-900/50 px-3.5 py-2"
        >
          <span className="font-mono text-xs font-semibold text-emerald-400">
            miniworld&gt;
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (e.g. w, look, map, save, help)..."
            aria-label="MiniWorld command input"
            className="flex-1 bg-transparent font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 font-mono text-[11px] text-zinc-200 hover:bg-zinc-700"
          >
            Run
          </button>
        </form>
      )}
    </div>
  );
};
