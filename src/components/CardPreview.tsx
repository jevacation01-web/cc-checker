import { useRef, useState } from "react";
import type { BrandDef } from "../lib/cards";
import { groupDigits } from "../lib/cards";
import { BrandMark } from "./BrandMark";
import { cn } from "../utils/cn";

export type Verdict = "pending" | "valid" | "invalid";

function Chip() {
  return (
    <svg viewBox="0 0 46 34" className="h-8 w-11 drop-shadow" aria-hidden>
      <defs>
        <linearGradient id="chipg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8c96a" />
          <stop offset="0.5" stopColor="#b98f2e" />
          <stop offset="1" stopColor="#e3bd55" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="44" height="32" rx="6" fill="url(#chipg)" stroke="#7a5c1c" strokeWidth="1" />
      <path
        d="M1 12h13v-6M1 22h13v6M45 12H32V6M45 22H32v6M14 1v32M32 1v32M14 17h18"
        stroke="#7a5c1c"
        strokeWidth="1.1"
        fill="none"
      />
    </svg>
  );
}

function Contactless() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M6 8.5a8.5 8.5 0 0 1 0 7" />
      <path d="M9.5 6.5a12 12 0 0 1 0 11" />
      <path d="M13 4.5a15.5 15.5 0 0 1 0 15" />
    </svg>
  );
}

export function CardPreview({
  digits,
  brand,
  name,
  expiry,
  cvv,
  flipped,
  verdict,
}: {
  digits: string;
  brand: BrandDef | null;
  name: string;
  expiry: string;
  cvv: string;
  flipped: boolean;
  verdict: Verdict;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [tilting, setTilting] = useState(false);

  const maxLen = brand ? Math.max(...brand.lengths) : 16;
  const groups = groupDigits(digits, brand);
  const pattern =
    brand?.gaps === "amex" ? [4, 6, 5] : brand?.gaps === "diners" && maxLen <= 14 ? [4, 6, 4] : Array(Math.ceil(maxLen / 4)).fill(4);
  const fillers = digits ? pattern.slice(groups.length).map((n) => "•".repeat(Math.min(n, 4))) : pattern.slice(1).map((n) => "•".repeat(Math.min(n, 4)));

  const onMove = (e: React.PointerEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--sx", `${px * 100}%`);
    el.style.setProperty("--sy", `${py * 100}%`);
    setTilt({ rx: (0.5 - py) * 14, ry: (px - 0.5) * 18 });
    setTilting(true);
  };
  const onLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setTilting(false);
  };

  const face = brand?.face ?? ["#1a2a2e", "#31505a"];
  const cvvLen = brand?.cvv.filter((n) => n > 0)[0] ?? 3;
  const displayName = name.trim() || "YOUR NAME HERE";

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-full max-w-[430px] select-none [perspective:1400px]"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {/* ambient glow under card */}
      <div
        className="absolute inset-x-6 -bottom-5 h-16 rounded-full blur-2xl transition-colors duration-700"
        style={{ background: `${face[1]}55` }}
      />
      <div
        className={cn("card3d relative aspect-[1.586] w-full", tilting && "tilting")}
        style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${flipped ? 180 + tilt.ry : tilt.ry}deg)` }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[18px] border border-white/15 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.75)] [backface-visibility:hidden]"
          style={{ background: `linear-gradient(118deg, ${face[0]} 8%, ${face[1]} 62%, ${face[0]} 130%)` }}
        >
          {/* guilloché-ish arcs */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.14]" viewBox="0 0 430 271" preserveAspectRatio="none" aria-hidden>
            {Array.from({ length: 9 }).map((_, i) => (
              <circle key={i} cx="430" cy="290" r={60 + i * 34} fill="none" stroke="white" strokeWidth="1" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <circle key={`b${i}`} cx="-30" cy="-40" r={50 + i * 40} fill="none" stroke="white" strokeWidth="0.8" />
            ))}
          </svg>
          <div className="sheen pointer-events-none absolute inset-0" />
          <div className="scanline pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-white/12 to-transparent" />

          <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.28em] text-white/70">SANDBOX ISSUER</div>
                <div className="mt-0.5 font-mono text-[10px] tracking-widest text-white/40">TEST ENVIRONMENT ONLY</div>
              </div>
              <Contactless />
            </div>

            <div className="flex items-center gap-4">
              <Chip />
              <div
                className="holo h-7 w-11 rounded-full border border-white/30"
                style={{ background: "conic-gradient(from 210deg, #7de8c9, #8ab8ff, #f2c66d, #f08fb0, #7de8c9)" }}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-baseline gap-x-[0.45em] font-mono text-[clamp(17px,4.6vw,23px)] font-medium tracking-[0.06em] text-white [text-shadow:0_1.5px_0_rgba(0,0,0,0.45)]">
                {groups.length === 0 && <span className="text-white/30">••••</span>}
                {groups.map((g, gi) => (
                  <span key={gi} className="chip-in inline-block" style={{ animationDelay: `${gi * 30}ms` }}>
                    {g}
                    {gi === groups.length - 1 && !flipped && <span className="blink ml-0.5 text-white/80">_</span>}
                  </span>
                ))}
                {fillers.map((f, i) => (
                  <span key={`f${i}`} className="text-white/25">
                    {f}
                  </span>
                ))}
              </div>
              <div className="mt-1.5 font-mono text-[10px] tracking-widest text-white/45">
                IIN {digits.slice(0, 6) || "——————"}
                {brand ? ` · ${brand.name.toUpperCase()}` : digits.length >= 2 ? " · MATCHING IIN…" : ""}
              </div>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[8.5px] tracking-[0.24em] text-white/50">CARD HOLDER</div>
                <div className={cn("truncate text-sm font-semibold tracking-[0.12em] uppercase", name.trim() ? "text-white" : "text-white/35")}>
                  {displayName}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[8.5px] tracking-[0.24em] text-white/50">EXPIRES</div>
                <div className={cn("font-mono text-sm tracking-widest", expiry ? "text-white" : "text-white/35")}>{expiry || "MM/YY"}</div>
              </div>
              <div className="h-8 shrink-0 [&>svg]:h-full [&>svg]:w-auto">
                <BrandMark brand={brand?.id ?? null} />
              </div>
            </div>
          </div>

          {/* verdict stamp */}
          {verdict !== "pending" && digits.length >= 12 && (
            <div
              key={verdict}
              className={cn(
                "stamp-in pointer-events-none absolute top-4 right-4 border-[3px] px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.22em] uppercase",
                verdict === "valid" ? "border-mint text-mint" : "border-coral text-coral"
              )}
              style={{ boxShadow: verdict === "valid" ? "0 0 18px rgba(62,207,174,0.35)" : "0 0 18px rgba(240,97,109,0.35)" }}
            >
              {verdict === "valid" ? "Format OK" : "Fails check"}
            </div>
          )}
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[18px] border border-white/15 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.75)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ background: `linear-gradient(295deg, ${face[0]} 8%, ${face[1]} 70%)` }}
        >
          <div className="mt-6 h-11 w-full bg-black/70" />
          <div className="px-5 pt-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="h-8 flex-1 rounded-sm bg-[repeating-linear-gradient(0deg,#e9e4d4_0_2px,#d8d2bd_2px_4px)]" />
              <div className="flex h-8 items-center rounded-sm border border-white/25 bg-white px-3 font-mono text-sm tracking-[0.3em] text-ink">
                {cvv ? "•".repeat(cvv.length) : "•".repeat(cvvLen)}
              </div>
            </div>
            <div className="mt-1.5 text-right font-mono text-[9px] tracking-[0.2em] text-white/55">
              {cvv ? `${cvv.length}-DIGIT ${brand?.id === "amex" ? "CID" : "CVV2"} PRESENT` : `AWAITING ${brand?.id === "amex" ? "CID (4)" : "CVV2 (3)"}`}
            </div>
            <p className="mt-4 text-[8.5px] leading-relaxed tracking-wide text-white/40">
              This card is property of the sandbox bank. Structural validation only — no authorisation is ever attempted. If found, return to
              the nearest developer.
            </p>
          </div>
          <div className="absolute right-5 bottom-4 h-7 [&>svg]:h-full [&>svg]:w-auto opacity-90">
            <BrandMark brand={brand?.id ?? null} />
          </div>
        </div>
      </div>

      <div className="mt-3 text-center font-mono text-[10px] tracking-[0.24em] text-faint uppercase">
        move pointer to inspect · focus CVV to flip
      </div>
    </div>
  );
}
