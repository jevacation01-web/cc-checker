import { BRANDS, TEST_CARDS, formatCard, luhnAnalyze, matchBrand } from "../lib/cards";
import { BrandMark } from "./BrandMark";
import { Reveal } from "./Reveal";
import { cn } from "../utils/cn";

// ── section heading ──────────────────────────────────────────

export function SectionHeading({ index, title, desc }: { index: string; title: string; desc: string }) {
  return (
    <Reveal className="mb-8">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="text-[clamp(26px,4vw,40px)] leading-none font-bold tracking-tight text-fog">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-dim">{desc}</p>
        </div>
        <span className="hidden shrink-0 font-mono text-[11px] tracking-[0.3em] text-faint sm:block">SEC.{index}</span>
      </div>
    </Reveal>
  );
}

// ── ticker ───────────────────────────────────────────────────

const TICKER_ITEMS = [
  "LUHN MOD-10",
  "IIN / BIN RANGES",
  "ISO 7812 LENGTH RULES",
  "EXPIRY MM/YY",
  "CVV · CID FORMAT",
  "ZERO NETWORK CALLS",
  "11 NETWORKS RECOGNISED",
  "DETERMINISTIC · OFFLINE",
];

export function Ticker() {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {TICKER_ITEMS.map((t) => (
        <span key={t} className="flex items-center">
          <span className="px-5 font-mono text-[11px] tracking-[0.28em] text-dim">{t}</span>
          <span className="text-mint/60">◆</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-y border-line bg-deep/70 py-2.5">
      <div className="ticker-track flex w-max">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

// ── the five methods ─────────────────────────────────────────

const METHODS = [
  {
    n: "01",
    name: "Luhn mod-10 checksum",
    spec: "ISO/IEC 7812-1",
    body: "From the rightmost digit, every second digit is doubled (subtracting 9 when the result exceeds 9). If the total is divisible by 10, the number is self-consistent. It catches any single-digit error and almost all adjacent transpositions — a typo filter, invented in 1954 and still printed into every PAN.",
    detail: "Σ weights mod 10 = 0 → pass",
  },
  {
    n: "02",
    name: "IIN / BIN network range",
    spec: "ISO/IEC 7812-1 §4",
    body: "The first 6–8 digits (Issuer Identification Number, once called BIN) are assigned by the card schemes. They fix the network, the issuing bank's country and product class. Matching the prefix against the published range tables tells you which scheme's rules apply — before any other check makes sense.",
    detail: "4 → Visa · 51–55 → MC · 37 → Amex …",
  },
  {
    n: "03",
    name: "PAN length rules",
    spec: "ISO/IEC 7812",
    body: "A PAN is 12–19 digits in total, but each scheme constrains it further: Amex is always 15, Mastercard 16, Visa 13/16/19, Maestro 12–19. A number with a perfect checksum but the wrong length for its detected network can never be a real card of that scheme.",
    detail: "Amex 15 · MC 16 · Visa 13|16|19",
  },
  {
    n: "04",
    name: "Expiry date window",
    spec: "MM/YY format",
    body: "Cards carry a four-digit expiry. A structurally sound card has a month 01–12 and a date that hasn't passed (cards remain valid through the final day of their expiry month). Dates 15+ years out are a soft flag — real issuers rarely go that far.",
    detail: "now ≤ MM/YY ≤ now + 15y",
  },
  {
    n: "05",
    name: "CVV / CVC / CID format",
    spec: "scheme card-security codes",
    body: "Three digits for every scheme except American Express, which prints a four-digit CID on the front. The right digit count per detected network is the check — the value itself can only ever be verified by the issuer, in an authorisation you're entitled to make.",
    detail: "3 digits · Amex CID 4",
  },
];

export function Methods() {
  return (
    <div>
      <div className="space-y-3">
        {METHODS.map((m, i) => (
          <Reveal key={m.n} delay={i * 60}>
            <div className="group grid gap-3 rounded-xl border border-line bg-panel/70 px-5 py-5 transition-all duration-300 hover:border-mint/40 hover:bg-panel2 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:px-6">
              <span className="font-mono text-2xl font-semibold text-faint transition-colors group-hover:text-mint">{m.n}</span>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-fog">
                  {m.name} <span className="ml-2 align-middle font-mono text-[9.5px] tracking-[0.2em] text-faint uppercase">{m.spec}</span>
                </h3>
                <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-dim">{m.body}</p>
              </div>
              <code className="justify-self-start rounded border border-line bg-deep px-3 py-1.5 font-mono text-[10.5px] tracking-wider text-steel sm:justify-self-end">
                {m.detail}
              </code>
            </div>
          </Reveal>
        ))}
      </div>

      {/* IIN range table */}
      <Reveal className="mt-8">
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="border-b border-line bg-panel2 px-5 py-3 sm:px-6">
            <h3 className="font-mono text-[11px] font-semibold tracking-[0.24em] text-dim uppercase">IIN prefix ranges — all recognised networks</h3>
          </div>
          <div className="grid gap-px bg-line/60 sm:grid-cols-2 lg:grid-cols-3">
            {BRANDS.map((b) => (
              <div key={b.id} className="flex items-center gap-3 bg-panel px-5 py-3.5 transition-colors hover:bg-panel2">
                <BrandMark brand={b.id} className="h-5 w-auto shrink-0 opacity-90" />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-fog">{b.name}</div>
                  <div className="truncate font-mono text-[10.5px] tracking-wide text-dim">{b.iinLabel} · {b.lengths.length > 3 ? `${Math.min(...b.lengths)}–${Math.max(...b.lengths)}` : b.lengths.join("|")} digits</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

// ── test card library ────────────────────────────────────────

export function TestLibrary({ onLoad }: { onLoad: (number: string) => void }) {
  return (
    <div>
      <Reveal>
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-panel2 px-5 py-3 sm:px-6">
            <h3 className="font-mono text-[11px] font-semibold tracking-[0.24em] text-dim uppercase">
              Published sandbox numbers — straight from PSP documentation
            </h3>
            <span className="font-mono text-[10px] text-faint">use any future expiry · CVV 123 (Amex 1234)</span>
          </div>
          <div className="grid gap-px bg-line/60 md:grid-cols-2">
            {TEST_CARDS.map((t) => (
              <button
                key={t.number}
                onClick={() => onLoad(t.number)}
                className="group flex items-center gap-4 bg-panel px-5 py-3.5 text-left transition-colors hover:bg-panel2"
              >
                <BrandMark brand={t.brandId} className="chip-in h-5 w-auto shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[13px] tracking-[0.08em] text-fog transition-colors group-hover:text-mint">
                    {formatCard(t.number, matchBrand(t.number))}
                  </div>
                  <div className="truncate text-[11px] text-dim">{t.note}</div>
                </div>
                <span className="shrink-0 font-mono text-[10px] tracking-widest text-faint uppercase opacity-0 transition-opacity group-hover:opacity-100">
                  load →
                </span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>
      <Reveal delay={80}>
        <p className="mt-4 max-w-2xl text-[11.5px] leading-relaxed text-faint">
          These are the numbers Stripe, Braintree and Adyen publish for sandbox testing: they pass every structural check and are
          hard-wired in test mode to simulate approvals, declines and 3-D Secure flows. They will never authorise against a live acquirer —
          which is exactly what makes them safe to type anywhere.
        </p>
      </Reveal>
    </div>
  );
}

// ── how luhn works (static example) ─────────────────────────

export function HowLuhn() {
  const example = "79927398713";
  const { steps, sum } = luhnAnalyze(example);
  return (
    <Reveal>
      <div className="overflow-hidden rounded-xl border border-line bg-panel/80">
        <div className="grid gap-0 lg:grid-cols-[1fr_1.35fr]">
          <div className="border-b border-line p-6 sm:p-8 lg:border-r lg:border-b-0">
            <h3 className="text-xl font-bold tracking-tight text-fog">The algorithm in one breath</h3>
            <ol className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-dim">
              <li><span className="font-mono text-mint">1.</span> Start from the <strong className="text-fog">rightmost</strong> digit — that's the check digit.</li>
              <li><span className="font-mono text-mint">2.</span> Moving left, double <strong className="text-fog">every second</strong> digit.</li>
              <li><span className="font-mono text-mint">3.</span> If a doubled value exceeds 9, <strong className="text-fog">subtract 9</strong> (same as adding its digits).</li>
              <li><span className="font-mono text-mint">4.</span> Add everything up. <strong className="text-fog">Total mod 10 = 0</strong> means the number is self-consistent.</li>
            </ol>
            <p className="mt-5 border-l-2 border-amber/60 pl-3 text-[12px] leading-relaxed text-dim">
              Hans Peter Luhn patented this in 1954 (US 2,950,048). It was designed to catch <em>accidents</em> — mistyped and transposed
              digits — not to prove a card exists. About 10% of all random digit strings satisfy it.
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] tracking-[0.24em] text-faint uppercase">
              <span>worked example</span>
              <span className="text-fog">{example}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex w-10 flex-col items-center rounded-md border py-2",
                    s.isCheck ? "border-mint/60 bg-mint/10" : s.doubled ? "border-amber/50 bg-amber/8" : "border-line bg-deep"
                  )}
                >
                  <span className="font-mono text-[10px] text-faint">{s.digit}</span>
                  <span className={cn("font-mono text-lg font-semibold", s.isCheck ? "text-mint" : s.doubled ? "text-amber" : "text-fog")}>{s.value}</span>
                  <span className="font-mono text-[8px] text-faint">{s.doubled ? "×2" + (s.digit * 2 > 9 ? "−9" : "") : s.isCheck ? "chk" : "="}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 font-mono text-xs leading-relaxed text-dim">
              {steps.map((s) => s.value).join(" + ")} = <span className="text-fog">{sum}</span>
              <span className="text-mint"> ✓ {sum} mod 10 = 0</span>
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ── legal / ethics panel ─────────────────────────────────────

export function LegalPanel() {
  return (
    <Reveal>
      <div className="overflow-hidden rounded-xl border border-amber/40 bg-[linear-gradient(120deg,rgba(242,180,65,0.09),rgba(242,180,65,0.03))]">
        <div className="grid gap-0 lg:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center border-b border-amber/30 bg-amber/10 px-8 py-6 lg:border-r lg:border-b-0">
            <svg viewBox="0 0 48 48" className="h-14 w-14 text-amber" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M24 5L44 40H4Z" />
              <path d="M24 18v10M24 33.5v.5" />
            </svg>
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-bold tracking-tight text-amber">What this lab is not</h3>
            <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-fog/85">
              CardBench performs <strong>structural</strong> validation only — arithmetic and pattern matching that runs entirely in your
              browser. It has no concept of “live” or “dead”, makes <strong>zero network requests</strong> (verify it in DevTools), and never
              can tell you whether an account exists or holds funds. Only an issuer can answer that, inside an authorisation you're
              entitled to make.
            </p>
            <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-fog/85">
              Testing guessed or third-party card numbers against payment gateways to see which are “live” is known as carding or card
              checking. It is fraud in essentially every jurisdiction — e.g. <span className="font-mono text-[12px] text-amber">18 U.S.C. § 1029</span> (access-device
              fraud) in the US, <span className="font-mono text-[12px] text-amber">Fraud Act 2006 s.2</span> in the UK, and{" "}
              <span className="font-mono text-[12px] text-amber">EU Directive 2019/713</span> across the Union — and it causes direct harm to the people whose
              cards are probed. This tool will not do that, and no prompt will change it.
            </p>
            <ul className="mt-4 grid gap-2 text-[12.5px] text-dim sm:grid-cols-2">
              {[
                "Building & QA-ing checkout forms",
                "Learning how card numbering works",
                "Validating input before hitting your PSP",
                "Writing test suites with published sandbox PANs",
              ].map((u) => (
                <li key={u} className="flex items-start gap-2">
                  <span className="mt-0.5 text-mint">✓</span>
                  {u}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ── footer ───────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="border-t border-line bg-deep/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <FooterChip />
            <span className="text-sm font-bold tracking-[0.18em] text-fog">CARDBENCH</span>
          </div>
          <p className="mt-2 max-w-md text-[11px] leading-relaxed text-faint">
            An educational payment-formats lab. Test numbers are published in the public documentation of Stripe, Braintree and Adyen.
            Not affiliated with Visa, Mastercard, American Express or any card scheme.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase">
          <a href="#lab" className="transition hover:text-mint">Lab</a>
          <a href="#methods" className="transition hover:text-mint">Methods</a>
          <a href="#batch" className="transition hover:text-mint">Batch</a>
          <a href="#sandbox" className="transition hover:text-mint">Sandbox PANs</a>
          <a href="#notice" className="transition hover:text-amber">Notice</a>
        </nav>
      </div>
      <div className="border-t border-line/60 py-4 text-center font-mono text-[9.5px] tracking-[0.3em] text-faint uppercase">
        everything computed locally · nothing uploaded · nothing stored
      </div>
    </footer>
  );
}

function FooterChip() {
  return (
    <svg viewBox="0 0 28 22" className="h-5 w-6" aria-hidden>
      <rect x="1" y="1" width="26" height="20" rx="3.5" fill="none" stroke="#3ecfae" strokeWidth="1.8" />
      <rect x="5" y="7" width="7" height="5" rx="1" fill="#f2b441" />
      <path d="M15 8.5h8M15 12h5" stroke="#8ba6a1" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
