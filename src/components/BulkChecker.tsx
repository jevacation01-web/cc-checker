import { useMemo, useState } from "react";
import { checkNumber, formatCard, type NumberCheck } from "../lib/cards";
import { BrandMark } from "./BrandMark";
import { Reveal } from "./Reveal";
import { cn } from "../utils/cn";

const SAMPLE = `4242 4242 4242 4242
5555 5555 5555 4444
3782 822463 10005
6011 1111 1111 1117
4111 1111 1111 1112
3056 9300 0902 0004
9999 8888 7777 6666`;

function VerdictChip({ v }: { v: NumberCheck["verdict"] }) {
  const map = {
    "valid-format": ["bg-mint/12 text-mint border-mint/40", "format valid"],
    "bad-luhn": ["bg-coral/12 text-coral border-coral/40", "fails luhn"],
    "bad-length": ["bg-amber/12 text-amber border-amber/40", "wrong length"],
    "unknown-iin": ["bg-amber/12 text-amber border-amber/40", "unknown IIN"],
  } as const;
  const [cls, label] = map[v];
  return <span className={cn("inline-block rounded border px-2 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase", cls)}>{label}</span>;
}

export function BulkChecker() {
  const [text, setText] = useState("");
  const [ran, setRan] = useState(false);

  const results = useMemo<NumberCheck[]>(() => {
    if (!ran) return [];
    return text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/[^\d]/g, ""))
      .filter((d) => d.length >= 12 && d.length <= 19)
      .slice(0, 500)
      .map((d) => checkNumber(d));
  }, [text, ran]);

  const stats = useMemo(() => {
    const valid = results.filter((r) => r.verdict === "valid-format").length;
    const badLuhn = results.filter((r) => r.verdict === "bad-luhn").length;
    return { total: results.length, valid, badLuhn, other: results.length - valid - badLuhn };
  }, [results]);

  const downloadCsv = () => {
    const rows = [
      "pan,brand,luhn_valid,length_ok,verdict",
      ...results.map((r) => `${r.digits},${r.brand?.name ?? "unknown"},${r.luhn.valid},${r.lengthOk},${r.verdict}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "cardbench-format-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Reveal>
      <div className="overflow-hidden rounded-xl border border-line bg-panel/80">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-mono text-sm font-semibold tracking-[0.18em] text-fog uppercase">Batch format sweep</h3>
            <p className="mt-1 text-xs text-dim">Paste up to 500 numbers — every line gets the same five structural checks, in-browser.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setText(SAMPLE);
                setRan(true);
              }}
              className="rounded border border-line px-3 py-1.5 font-mono text-[10px] tracking-widest text-dim uppercase transition hover:border-steel/60 hover:text-steel"
            >
              load sample
            </button>
            <button
              onClick={() => setRan(true)}
              disabled={!text.trim()}
              className="rounded bg-mint px-4 py-1.5 font-mono text-[10px] font-semibold tracking-widest text-ink uppercase transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              run sweep
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="border-b border-line p-5 sm:p-6 lg:border-r lg:border-b-0">
            <textarea
              className="h-56 w-full resize-none rounded-lg border border-line bg-deep p-4 font-mono text-[13px] leading-relaxed tracking-wider text-fog placeholder:text-faint/60 outline-none transition focus:border-mint/60 focus:ring-2 focus:ring-mint/15"
              placeholder={"one PAN per line, e.g.\n4242 4242 4242 4242\n5555 5555 5555 4444"}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setRan(false);
              }}
              spellCheck={false}
            />
            <p className="mt-3 text-[10.5px] leading-relaxed text-faint">
              Only lines containing a 12–19 digit sequence are read. Nothing is transmitted — open DevTools → Network and watch it stay
              empty.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {!ran || results.length === 0 ? (
              <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center">
                <svg viewBox="0 0 40 40" className="h-10 w-10 text-faint" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="8" width="32" height="24" rx="4" />
                  <path d="M4 15h32M10 25h8" strokeLinecap="round" />
                </svg>
                <p className="font-mono text-xs text-faint">{ran ? "no parseable PANs found in that text" : "results will render here"}</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded border border-line bg-deep px-2.5 py-1 font-mono text-[10px] tracking-wider text-dim uppercase">
                    {stats.total} parsed
                  </span>
                  <span className="rounded border border-mint/40 bg-mint/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-mint uppercase">
                    {stats.valid} format-valid
                  </span>
                  <span className="rounded border border-coral/40 bg-coral/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-coral uppercase">
                    {stats.badLuhn} fail luhn
                  </span>
                  {stats.other > 0 && (
                    <span className="rounded border border-amber/40 bg-amber/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-amber uppercase">
                      {stats.other} iin/length
                    </span>
                  )}
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => navigator.clipboard?.writeText(results.map((r) => `${r.digits} → ${r.verdict}`).join("\n"))}
                      className="rounded border border-line px-2.5 py-1 font-mono text-[10px] tracking-widest text-dim uppercase transition hover:border-steel/60 hover:text-steel"
                    >
                      copy
                    </button>
                    <button
                      onClick={downloadCsv}
                      className="rounded border border-line px-2.5 py-1 font-mono text-[10px] tracking-widest text-dim uppercase transition hover:border-mint/60 hover:text-mint"
                    >
                      csv ↓
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-auto rounded-lg border border-line">
                  <table className="w-full text-left font-mono text-[11.5px]">
                    <thead className="sticky top-0 bg-panel2 text-[9.5px] tracking-[0.18em] text-faint uppercase">
                      <tr>
                        <th className="px-3 py-2 font-medium">#</th>
                        <th className="px-3 py-2 font-medium">PAN</th>
                        <th className="px-3 py-2 font-medium">Network</th>
                        <th className="px-3 py-2 font-medium">Σ</th>
                        <th className="px-3 py-2 font-medium">Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} className="chip-in border-t border-line/60 transition-colors hover:bg-raise/50" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                          <td className="px-3 py-2 text-faint">{String(i + 1).padStart(2, "0")}</td>
                          <td className="px-3 py-2 tracking-wider whitespace-nowrap text-fog">{formatCard(r.digits, r.brand)}</td>
                          <td className="px-3 py-2">
                            <span className="flex items-center gap-1.5 whitespace-nowrap text-dim">
                              <BrandMark brand={r.brand?.id ?? null} className="h-3 w-auto opacity-80" />
                              {r.brand?.name ?? "—"}
                            </span>
                          </td>
                          <td className={cn("px-3 py-2", r.luhn.valid ? "text-mint" : "text-coral")}>{r.luhn.sum}</td>
                          <td className="px-3 py-2">
                            <VerdictChip v={r.verdict} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[10.5px] text-faint">
                  “format-valid” ≠ “active account”. Roughly 1 in 10 random digit strings pass Luhn — the checksum filters typos, nothing
                  more.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
