import { useMemo, useState } from "react";
import {
  candidateBrands,
  checkDigitFor,
  formatCard,
  type BrandDef,
  type CvvResult,
  type ExpiryResult,
  type LuhnResult,
} from "../lib/cards";
import { BrandMark } from "./BrandMark";
import { cn } from "../utils/cn";

type Status = "idle" | "ok" | "warn" | "bad";

function StatusIcon({ status }: { status: Status }) {
  if (status === "ok")
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10.5l4 4L16 6" />
      </svg>
    );
  if (status === "bad")
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M5 5l10 10M15 5L5 15" />
      </svg>
    );
  if (status === "warn")
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 3.5L18 17H2Z" strokeLinejoin="round" />
        <path d="M10 9v3.4M10 14.8v.4" />
      </svg>
    );
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 10h10" />
    </svg>
  );
}

const statusColor: Record<Status, string> = {
  idle: "text-dim border-line",
  ok: "text-mint border-mint/40 bg-mint/8",
  warn: "text-amber border-amber/40 bg-amber/8",
  bad: "text-coral border-coral/40 bg-coral/8",
};

function Row({
  index,
  label,
  status,
  detail,
  hint,
}: {
  index: string;
  label: string;
  status: Status;
  detail: string;
  hint?: string;
}) {
  return (
    <div
      key={status}
      className={cn("chip-in flex items-center gap-3 border-l-2 px-3 py-2.5 transition-colors", statusColor[status])}
    >
      <span className="font-mono text-[10px] text-faint">{index}</span>
      <StatusIcon status={status} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-fog">{label}</span>
        {hint && <span className="block text-[11px] text-dim">{hint}</span>}
      </span>
      <span className="shrink-0 text-right font-mono text-[11px] leading-tight">{detail}</span>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-deep px-4 py-3 font-mono text-lg tracking-[0.12em] text-fog placeholder:text-faint/70 outline-none transition focus:border-mint/60 focus:ring-2 focus:ring-mint/15";

export function LabForm({
  digits,
  setDigits,
  expiry,
  setExpiry,
  cvv,
  setCvv,
  name,
  setName,
  setFlipped,
  brand,
  luhn,
  expiryResult,
  cvvResult,
}: {
  digits: string;
  setDigits: (d: string) => void;
  expiry: string;
  setExpiry: (e: string) => void;
  cvv: string;
  setCvv: (c: string) => void;
  name: string;
  setName: (n: string) => void;
  setFlipped: (f: boolean) => void;
  brand: BrandDef | null;
  luhn: LuhnResult;
  expiryResult: ExpiryResult;
  cvvResult: CvvResult;
}) {
  const candidates = !brand ? candidateBrands(digits) : [];
  const lengthOk = brand ? brand.lengths.includes(digits.length) : digits.length >= 12 && digits.length <= 19;
  const numberOk = digits.length >= 12 && !!brand && lengthOk && luhn.valid;
  const allOk = numberOk && expiryResult.status === "ok" && cvvResult.ok;

  const expiryStatus: Status =
    expiryResult.status === "ok" ? "ok" : expiryResult.status === "empty" || expiryResult.status === "short" ? "idle" : expiryResult.status === "far-future" ? "warn" : "bad";
  const luhnStatus: Status = !digits ? "idle" : luhn.valid ? "ok" : "bad";
  const iinStatus: Status = !digits ? "idle" : brand ? "ok" : digits.length >= 4 ? "bad" : "idle";
  const lenStatus: Status = !digits ? "idle" : lengthOk ? "ok" : digits.length >= (brand ? Math.min(...brand.lengths) : 12) ? "bad" : "idle";
  const cvvStatus: Status = !cvv ? "idle" : cvvResult.ok ? "ok" : "bad";

  return (
    <div className="rounded-xl border border-line bg-panel/80 p-5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.8)] sm:p-6">
      {/* number */}
      <label className="block">
        <span className="mb-2 flex items-center justify-between text-[10px] font-semibold tracking-[0.26em] text-dim uppercase">
          Card number (PAN)
          <span className="flex h-5 items-center gap-2">
            {brand ? (
              <>
                <BrandMark brand={brand.id} className="h-4 w-auto" />
                <span className="font-mono text-[10px] tracking-normal text-fog normal-case">{brand.name}</span>
              </>
            ) : candidates.length > 0 && digits.length >= 1 ? (
              <span className="font-mono text-[10px] tracking-normal text-faint normal-case">
                could be {candidates.slice(0, 3).map((c) => c.name).join(" / ")}
              </span>
            ) : null}
          </span>
        </span>
        <input
          className={inputCls}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          placeholder="4242 4242 4242 4242"
          value={formatCard(digits, brand)}
          onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 19))}
        />
      </label>

      {/* expiry / cvv / name */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1.4fr]">
        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold tracking-[0.26em] text-dim uppercase">Expiry</span>
          <input
            className={cn(inputCls, "text-base")}
            inputMode="numeric"
            placeholder="MM/YY"
            autoComplete="off"
            value={expiry}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 4);
              setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
            }}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold tracking-[0.26em] text-dim uppercase">
            {brand?.id === "amex" ? "CID (4)" : "CVV"}
          </span>
          <input
            className={cn(inputCls, "text-base")}
            inputMode="numeric"
            placeholder={brand?.id === "amex" ? "1234" : "123"}
            autoComplete="off"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onFocus={() => setFlipped(true)}
            onBlur={() => setFlipped(false)}
          />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="mb-2 block text-[10px] font-semibold tracking-[0.26em] text-dim uppercase">Holder</span>
          <input
            className={cn(inputCls, "text-base tracking-[0.08em]")}
            placeholder="ADA LOVELACE"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z .'-]/g, "").slice(0, 24))}
          />
        </label>
      </div>

      {/* checklist */}
      <div className="mt-5 space-y-1.5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10px] font-semibold tracking-[0.26em] text-dim uppercase">Structural checks</h3>
          <span className="font-mono text-[10px] text-faint">offline · deterministic</span>
        </div>
        <Row
          index="01"
          label="Luhn mod-10 checksum"
          status={luhnStatus}
          detail={!digits ? "—" : `Σ=${luhn.sum} · mod10=${luhn.mod}${luhn.valid ? " ✓" : ` → try ${luhn.suggestedCheck}`}`}
        />
        <Row
          index="02"
          label="IIN / BIN network range"
          status={iinStatus}
          detail={!digits ? "—" : brand ? `${digits.slice(0, 6)} → ${brand.name}` : "no network match"}
          hint={brand ? `range ${brand.iinLabel}` : digits.length >= 4 ? "prefix not assigned to any scheme" : undefined}
        />
        <Row
          index="03"
          label="PAN length"
          status={lenStatus}
          detail={!digits ? "—" : brand ? `${digits.length} of ${brand.lengths.join("|")} digits` : `${digits.length}/12–19`}
        />
        <Row index="04" label="Expiry date" status={expiryStatus} detail={expiryResult.label} />
        <Row index="05" label={brand?.id === "amex" ? "CID format" : "CVV format"} status={cvvStatus} detail={!cvv ? `expects ${cvvResult.expected}` : cvvResult.label} />
      </div>

      {/* verdict */}
      <div
        className={cn(
          "mt-4 rounded-lg border px-4 py-3 transition-colors duration-500",
          allOk
            ? "border-mint/50 bg-mint/10"
            : numberOk
              ? "border-amber/50 bg-amber/10"
              : "border-coral/40 bg-coral/8"
        )}
      >
        <div className="flex items-center gap-3">
          <span className={cn("h-2.5 w-2.5 rounded-full", allOk ? "pulse-dot bg-mint" : numberOk ? "bg-amber" : "bg-coral")} />
          <p className={cn("font-mono text-sm font-semibold tracking-[0.14em] uppercase", allOk ? "text-mint" : numberOk ? "text-amber" : "text-coral")}>
            {allOk ? "All five checks pass" : numberOk ? "Number format valid — finish expiry / CVV" : digits ? "Fails structural validation" : "Awaiting a card number"}
          </p>
        </div>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-dim">
          This verdict is about <em>shape</em>, not funds. A number can pass every check here and still belong to a closed account, a
          stranger, or no one. Whether a card is “live” is known only to its issuer — and probing for it with cards that aren't yours is
          fraud.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

export function LuhnPanel({ digits, luhn, brand }: { digits: string; luhn: LuhnResult; brand: BrandDef | null }) {
  const [partial, setPartial] = useState("");
  const completed = useMemo(() => (partial.replace(/\D/g, "").length >= 11 ? partial.replace(/\D/g, "") + checkDigitFor(partial.replace(/\D/g, "")) : ""), [partial]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      {/* arithmetic trace */}
      <div className="overflow-hidden rounded-xl border border-line bg-panel/80">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h3 className="text-[10px] font-semibold tracking-[0.26em] text-dim uppercase">Luhn arithmetic — live trace</h3>
          <span className="font-mono text-[10px] text-faint">ISO/IEC 7812-1</span>
        </div>
        <div className="p-5">
          {!digits ? (
            <p className="py-6 text-center font-mono text-xs text-faint">type a number above and the mod-10 math unfolds here</p>
          ) : (
            <>
              <div key={`trace-${digits.length}`} className="flex flex-wrap gap-1.5">
                {luhn.steps.map((s, i) => (
                  <div
                    key={i}
                    className={cn(
                      "chip-in flex w-9 flex-col items-center rounded-md border py-1.5",
                      s.isCheck ? "border-mint/60 bg-mint/10" : s.doubled ? "border-amber/50 bg-amber/8" : "border-line bg-deep"
                    )}
                    style={{ animationDelay: `${i * 22}ms` }}
                  >
                    <span className="font-mono text-[9px] text-faint line-through decoration-faint/50">{s.digit}</span>
                    <span className={cn("font-mono text-base font-semibold", s.isCheck ? "text-mint" : s.doubled ? "text-amber" : "text-fog")}>
                      {s.value}
                    </span>
                    <span className="font-mono text-[8px] tracking-wider text-faint">{s.doubled ? (s.digit * 2 > 9 ? "×2−9" : "×2") : s.isCheck ? "CHK" : "·"}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1 font-mono text-xs leading-relaxed">
                <p className="break-all text-dim">
                  <span className="text-faint">weights →</span> {luhn.steps.map((s) => s.value).join(" + ")}
                </p>
                <p>
                  <span className="text-faint">Σ =</span> <span className="text-fog">{luhn.sum}</span>
                  <span className="text-faint"> · </span>
                  <span className="text-fog">{luhn.sum} mod 10 = {luhn.mod}</span>
                  {luhn.valid ? (
                    <span className="ml-2 text-mint">✓ divisible by 10 — checksum passes</span>
                  ) : (
                    <span className="ml-2 text-coral">
                      ✗ not divisible by 10 — check digit should be <span className="rounded bg-coral/15 px-1.5 py-0.5 text-coral">{luhn.suggestedCheck}</span>
                    </span>
                  )}
                </p>
                {brand && <p className="text-faint">grouping {brand.gaps === "amex" ? "4·6·5 (Amex)" : brand.gaps === "diners" ? "4·6·4 (Diners)" : "4·4·4·4"} · every 2nd digit from the right is doubled</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* check-digit tool */}
      <div className="rounded-xl border border-line bg-panel/80">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h3 className="text-[10px] font-semibold tracking-[0.26em] text-dim uppercase">Check-digit bench</h3>
          <span className="font-mono text-[10px] text-faint">append · repair</span>
        </div>
        <div className="p-5">
          <p className="text-xs leading-relaxed text-dim">
            Paste any partial PAN (your own test prefix + account digits) and the correct Luhn check digit is computed instantly — the
            same routine banks' embossers and form validators run.
          </p>
          <input
            className={cn(inputCls, "mt-4 text-base")}
            inputMode="numeric"
            placeholder="4242 4242 4242 424"
            value={partial}
            onChange={(e) => setPartial(e.target.value.replace(/\D/g, "").slice(0, 18))}
          />
          <div className="mt-3 rounded-lg border border-dashed border-line bg-deep px-4 py-3">
            {completed ? (
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm tracking-[0.1em] text-fog">
                  {completed.slice(0, -1)}
                  <span className="rounded bg-mint/20 px-1 text-mint">{completed.slice(-1)}</span>
                </span>
                <button
                  onClick={() => navigator.clipboard?.writeText(completed)}
                  className="shrink-0 rounded border border-line px-2.5 py-1 font-mono text-[10px] tracking-widest text-dim uppercase transition hover:border-mint/50 hover:text-mint"
                >
                  copy
                </button>
              </div>
            ) : (
              <span className="font-mono text-xs text-faint">needs ≥ 11 digits to complete…</span>
            )}
          </div>
          <p className="mt-3 text-[10.5px] leading-relaxed text-faint">
            Completing a number makes it <em>plausible</em>, not real — ~1 in 10 random numbers pass Luhn by chance. That's the point: it's
            a typo filter, not a vault key.
          </p>
        </div>
      </div>
    </div>
  );
}
