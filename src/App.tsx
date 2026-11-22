import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  Download,
  Eye,
  FlaskConical,
  FolderOpen,
  RotateCcw,
  Save,
  Upload,
} from 'lucide-react';
import { CellCoord } from './engine/CellCoord';
import { Game } from './engine/Game';
import { LogEntry, TerminalConsole } from './components/TerminalConsole';
import { TestsModal } from './components/TestsModal';
import { WorldGridView } from './components/WorldGridView';

function createInitialLogs(game: Game): LogEntry[] {
  return [
    {
      id: 1,
      kind: 'system',
      text: [
        '====================================',
        '       Welcome to MiniWorld!',
        '  Open-world grid engine prototype',
        '====================================',
      ].join('\n'),
    },
    { id: 2, kind: 'output', text: game.helpText() },
    { id: 3, kind: 'output', text: game.renderText() },
    { id: 4, kind: 'system', text: game.statusText() },
  ];
}

export function App() {
  const gameRef = useRef<Game>(new Game());
  const nextLogId = useRef<number>(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tick, setTick] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    createInitialLogs(gameRef.current)
  );
  const [terminated, setTerminated] = useState(false);
  const [selectedCell, setSelectedCell] = useState<CellCoord | null>(null);
  const [saveFileName, setSaveFileName] = useState('savegame.mw');
  const [testsOpen, setTestsOpen] = useState(false);

  const appendLog = useCallback((kind: LogEntry['kind'], text: string) => {
    const id = nextLogId.current++;
    setLogs((prev) => [...prev.slice(-120), { id, kind, text }]);
  }, []);

  const executeCommand = useCallback(
    (raw: string) => {
      const game = gameRef.current;
      const trimmed = raw.trim();
      if (!trimmed || terminated) return;

      appendLog('command', `miniworld> ${trimmed}`);

      const parts = trimmed.split(/\s+/);
      const command = parts[0].toLowerCase();
      const arg = parts[1];

      if (command === 'q' || command === 'quit' || command === 'exit') {
        appendLog('system', 'Thanks for exploring MiniWorld. Goodbye!');
        setTerminated(true);
        return;
      }

      if (command === 'clear') {
        setLogs([]);
        return;
      }

      if (
        command === 'w' ||
        command === 'a' ||
        command === 's' ||
        command === 'd'
      ) {
        const result = game.movePlayer(command);
        if (!result.moved && result.message) {
          appendLog('error', result.message);
        } else if (result.message) {
          appendLog('stream', result.message);
        }
        appendLog('output', game.renderText());
        appendLog('system', game.statusText());
        setSelectedCell(null);
        setTick((t) => t + 1);
        return;
      }

      if (command === 'map') {
        appendLog('output', game.renderText());
        return;
      }

      if (command === 'status') {
        appendLog('system', game.statusText());
        return;
      }

      if (command === 'look') {
        appendLog('output', game.inspectText());
        return;
      }

      if (command === 'help' || command === 'h') {
        appendLog('output', game.helpText());
        return;
      }

      if (command === 'save') {
        const target = arg || saveFileName.trim() || 'savegame.mw';
        const res = game.save(target);
        if (res.success) {
          setSaveFileName(target);
          appendLog('system', `Game saved to ${target}.`);
        } else {
          appendLog('error', `Error: ${res.error}`);
        }
        setTick((t) => t + 1);
        return;
      }

      if (command === 'load') {
        const target = arg || saveFileName.trim() || 'savegame.mw';
        const res = game.load(target);
        if (res.success) {
          setSaveFileName(target);
          appendLog('system', `Game loaded from ${target}.`);
          appendLog('output', game.renderText());
          appendLog('system', game.statusText());
          setSelectedCell(null);
        } else {
          appendLog('error', `Error: ${res.error}`);
        }
        setTick((t) => t + 1);
        return;
      }

      appendLog(
        'error',
        "Unknown command. Type 'help' to see available commands."
      );
    },
    [appendLog, saveFileName, terminated]
  );

  const handleRestart = useCallback(() => {
    const freshGame = new Game();
    gameRef.current = freshGame;
    nextLogId.current = 5;
    setLogs(createInitialLogs(freshGame));
    setTerminated(false);
    setSelectedCell(null);
    setTick((t) => t + 1);
  }, []);

  // Global keyboard shortcuts for WASD and Arrow keys when not typing in inputs
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (terminated || testsOpen) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const keyMap: Record<string, string> = {
        w: 'w',
        W: 'w',
        ArrowUp: 'w',
        s: 's',
        S: 's',
        ArrowDown: 's',
        a: 'a',
        A: 'a',
        ArrowLeft: 'a',
        d: 'd',
        D: 'd',
        ArrowRight: 'd',
      };

      const cmd = keyMap[e.key];
      if (cmd) {
        e.preventDefault();
        executeCommand(cmd);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [executeCommand, terminated, testsOpen]);

  const handleExportMw = () => {
    const content = gameRef.current.serializeSave();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = saveFileName.trim() || 'savegame.mw';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    appendLog('system', `Exported MINIWORLD_SAVE_V1 file (${link.download}).`);
  };

  const handleImportMw = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const res = gameRef.current.deserializeSave(content);
      if (res.success) {
        appendLog('system', `Game loaded from ${file.name}.`);
        appendLog('output', gameRef.current.renderText());
        appendLog('system', gameRef.current.statusText());
        setSelectedCell(null);
        setTick((t) => t + 1);
      } else {
        appendLog('error', `Error: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const game = gameRef.current;
  const player = game.getPlayer();
  const pos = player.getPosition();
  const currentCell = player.getCurrentCell();
  const streamer = game.getStreamer();
  const inspectedCell = selectedCell ?? currentCell;
  const inspectedObjects = game.getObjects().getObjectsInCell(inspectedCell);
  const savedFiles = game.listSavedFiles();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-mono text-base font-bold tracking-tight text-zinc-100">
                MiniWorld Engine
              </h1>
              <p className="text-xs text-zinc-400">
                2D open-world grid, streaming window &amp; cell-collision prototype
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTestsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-200 hover:bg-zinc-800"
            >
              <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />
              Run Engine Tests
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-200 hover:bg-zinc-800"
            >
              <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
              Reset World
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-12">
        {/* Left Column: Interactive Grid + Controls + Inspector */}
        <section className="flex flex-col gap-4 lg:col-span-7">
          {/* Status Metrics Bar */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
              <div className="text-[11px] text-zinc-500">World Position</div>
              <div className="font-mono text-sm font-semibold text-zinc-100">
                ({pos.x}, {pos.y})
              </div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
              <div className="text-[11px] text-zinc-500">Current Cell</div>
              <div className="font-mono text-sm font-semibold text-emerald-400">
                ({currentCell.x}, {currentCell.y})
              </div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
              <div className="text-[11px] text-zinc-500">Loaded Cells</div>
              <div className="font-mono text-sm font-semibold text-sky-300">
                {streamer.loadedCellCount()}
                <span className="ml-1.5 text-[11px] font-normal text-zinc-500">
                  (+{streamer.getLastLoadedCount()}/-{streamer.getLastUnloadedCount()})
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
              <div className="text-[11px] text-zinc-500">World Objects</div>
              <div className="font-mono text-sm font-semibold text-amber-300">
                {game.getObjects().objectCount()}
              </div>
            </div>
          </div>

          {/* 2D Grid */}
          <WorldGridView
            game={game}
            selectedCell={selectedCell}
            onSelectCell={(cell) => setSelectedCell(cell)}
            tick={tick}
          />

          {/* Controls + Cell Inspector + Save/Load */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Movement & Quick Actions */}
            <div className="flex flex-col justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">
                  Controls (WASD / Arrow Keys)
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  Step: {game.getStepSize()}u
                </span>
              </div>

              <div className="flex items-center justify-center gap-6 py-1">
                <div className="grid grid-cols-3 gap-1.5">
                  <div />
                  <button
                    type="button"
                    disabled={terminated}
                    onClick={() => executeCommand('w')}
                    className="flex h-10 w-10 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-40"
                    title="Move North (W)"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <div />
                  <button
                    type="button"
                    disabled={terminated}
                    onClick={() => executeCommand('a')}
                    className="flex h-10 w-10 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-40"
                    title="Move West (A)"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={terminated}
                    onClick={() => executeCommand('s')}
                    className="flex h-10 w-10 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-40"
                    title="Move South (S)"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={terminated}
                    onClick={() => executeCommand('d')}
                    className="flex h-10 w-10 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-40"
                    title="Move East (D)"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    disabled={terminated}
                    onClick={() => executeCommand('look')}
                    className="inline-flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
                  >
                    <Eye className="h-3.5 w-3.5 text-amber-300" />
                    look
                  </button>
                  <button
                    type="button"
                    disabled={terminated}
                    onClick={() => executeCommand('map')}
                    className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
                  >
                    map
                  </button>
                  <button
                    type="button"
                    disabled={terminated}
                    onClick={() => executeCommand('status')}
                    className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
                  >
                    status
                  </button>
                </div>
              </div>
            </div>

            {/* Cell Inspector & Save/Load */}
            <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">
                    Cell Inspector ({inspectedCell.x}, {inspectedCell.y})
                  </span>
                  {selectedCell && (
                    <button
                      type="button"
                      onClick={() => setSelectedCell(null)}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Back to player cell
                    </button>
                  )}
                </div>
                <div className="rounded border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-xs text-zinc-300">
                  {inspectedObjects.length === 0 ? (
                    <span className="text-zinc-500">
                      There is nothing notable here.
                    </span>
                  ) : (
                    inspectedObjects.map((obj) => (
                      <div key={obj.id} className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-100">
                            [{obj.symbol}] {obj.name}
                          </span>
                          <span
                            className={`text-[10px] ${
                              obj.blocking ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {obj.blocking ? 'blocking' : 'passable'}
                          </span>
                        </div>
                        <p className="text-zinc-400">{obj.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">
                    Save / Load (MINIWORLD_SAVE_V1)
                  </span>
                  {savedFiles.length > 0 && (
                    <span className="font-mono text-[10px] text-zinc-500">
                      Saved: {savedFiles.join(', ')}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="text"
                    value={saveFileName}
                    onChange={(e) => setSaveFileName(e.target.value)}
                    aria-label="Save filename"
                    className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={terminated}
                    onClick={() => executeCommand(`save ${saveFileName}`)}
                    className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 font-mono text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
                    title="Save to browser storage"
                  >
                    <Save className="h-3 w-3 text-emerald-400" />
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={terminated}
                    onClick={() => executeCommand(`load ${saveFileName}`)}
                    className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 font-mono text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
                    title="Load from browser storage"
                  >
                    <FolderOpen className="h-3 w-3 text-sky-400" />
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMw}
                    className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 font-mono text-xs text-zinc-200 hover:bg-zinc-700"
                    title="Download .mw save file"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={terminated}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 font-mono text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
                    title="Import .mw save file"
                  >
                    <Upload className="h-3 w-3" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mw,.txt"
                    onChange={handleImportMw}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Terminal Console */}
        <section className="lg:col-span-5">
          <TerminalConsole
            logs={logs}
            terminated={terminated}
            onExecuteCommand={executeCommand}
            onRestart={handleRestart}
          />
        </section>
      </main>

      <TestsModal open={testsOpen} onClose={() => setTestsOpen(false)} />
    </div>
  );
}

export default App;
