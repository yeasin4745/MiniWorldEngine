import React, { useMemo } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { runEngineTests } from '../engine/engineTests';

interface TestsModalProps {
  open: boolean;
  onClose: () => void;
}

export const TestsModal: React.FC<TestsModalProps> = ({ open, onClose }) => {
  const summary = useMemo(() => (open ? runEngineTests() : null), [open]);

  if (!open || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/70 px-4 py-3">
          <div>
            <h2 className="font-mono text-sm font-semibold text-zinc-100">
              MiniWorld Engine Automated Tests
            </h2>
            <p className="text-xs text-zinc-400">
              Ported from tests/test_main.cpp ({summary.passedCount} passed,{' '}
              {summary.failedCount} failed)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Close test results"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto p-4 font-mono text-xs">
          {summary.results.map((item, idx) => (
            <div
              key={`${item.suite}-${idx}`}
              className="flex items-center justify-between rounded border border-zinc-800/80 bg-zinc-900/40 px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                {item.passed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <span className="text-zinc-200">{item.name}</span>
              </div>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                {item.suite}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/60 px-4 py-2.5 font-mono text-xs">
          <span
            className={
              summary.failedCount === 0 ? 'text-emerald-400' : 'text-rose-400'
            }
          >
            Tests passed: {summary.passedCount} | Failed: {summary.failedCount}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-200 hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
