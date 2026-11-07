import { useEffect, useMemo, useState } from "react";
import {
  luhnAnalyze,
  matchBrand,
  validateCvv,
  validateExpiry,
} from "./lib/cards";
import { CardPreview, type Verdict } from "./components/CardPreview";
import { LabForm, LuhnPanel } from "./components/Lab";
import { BulkChecker } from "./components/BulkChecker";
import {
  Footer,
  HowLuhn,
  LegalPanel,
  Methods,
  SectionHeading,
  TestLibrary,
  Ticker,
} from "./components/InfoSections";
import { Reveal } from "./components/Reveal";

function LogoChip() {
  return (
    <svg viewBox="0 0 28 22" className="h-6 w-7" aria-hidden>
      <rect x="1" y="1" width="26" height="20" rx="3.5" fill="none" stroke="#3ecfae" strokeWidth="1.8" />
      <rect x="5" y="7" width="7" height="5" rx="1" fill="#f2b441" />
      <path d="M15 8.5h8M15 12h5" stroke="#8ba6a1" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-[11px] tracking-[0.18em] text-dim tabular-nums">
      {now.toLocaleTimeString("en-GB")}
    </span>
  );
}

export default function App() {
  const [digits, setDigits] = useState("4242424242424242");
  const [expiry, setExpiry] = useState("12/29");
  const [cvv, setCvv] = useState("123");
  const [name, setName] = useState("ADA LOVELACE");
  const [flipped, setFlipped] = useState(false);

  const brand = useMemo(() => matchBrand(digits), [digits]);
  const luhn = useMemo(() => luhnAnalyze(digits), [digits]);
  const expiryResult = useMemo(() => validateExpiry(expiry), [expiry]);
  const cvvResult = useMemo(() => validateCvv(cvv, brand), [cvv, brand]);

  const lengthOk = brand ? brand.lengths.includes(digits.length) : digits.length >= 12 && digits.length <= 19;
  const verdict: Verdict =
    digits.length < 12 ? "pending" : brand && lengthOk && luhn.valid ? "valid" : "invalid";

  const loadSandbox = (number: string) => {
    const b = matchBrand(number);
    setDigits(number);
    setExpiry("12/29");
    setCvv(b?.id === "amex" ? "1234" : "123");
    setName("SANDBOX USER");
    setFlipped(false);
    document.getElementById("lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      {/* ── header ── */}
      <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <a href="#lab" className="flex items-center gap-2.5">
            <LogoChip />
            <span className="text-[15px] font-bold tracking-[0.18em] text-fog">CARDBENCH</span>
            <span className="mt-0.5 hidden font-mono text-[9.5px] tracking-[0.24em] text-faint uppercase md:block">
              payment formats lab
            </span>
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 rounded-full border border-mint/40 bg-mint/8 px-3 py-1 font-mono text-[9.5px] tracking-[0.2em] text-mint uppercase sm:flex">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
              offline · no gateway checks
            </span>
            <Clock />
          </div>
        </div>
      </header>

      <Ticker />

      {/* ── opening ── */}
      <section className="relative mx-auto max-w-6xl px-5 pt-14 pb-10 sm:pt-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <p className="mb-4 font-mono text-[10.5px] tracking-[0.34em] text-amber uppercase">
              ISO/IEC 7812 · Luhn 1954 · eleven networks
            </p>
            <h1 className="text-[clamp(38px,7vw,76px)] leading-[0.95] font-bold tracking-tight text-fog">
              Every check a card number
              <br />
              can fail — <span className="text-mint">run offline.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-dim">
              CardBench decomposes a PAN the way real payment stacks do: Luhn checksum, IIN/BIN network range, length rules, expiry
              window and CVV format. All five methods, live in your browser, with the arithmetic visible. No gateway, no authorisation,
              no “live/dead” — a number's shape is not its balance.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-xl border border-line bg-deep/80 p-5 font-mono text-[11.5px] leading-loose shadow-[0_18px_50px_-24px_rgba(0,0,0,0.8)]">
              <p className="text-faint">
                <span className="text-mint">$</span> cardbench check 4242 4242 4242 4242
              </p>
              <p className="text-dim">
                luhn&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint">PASS</span> Σ=80 · mod10=0
              </p>
              <p className="text-dim">
                iin&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint">PASS</span> 424242 → Visa
              </p>
              <p className="text-dim">
                length&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint">PASS</span> 16/16
              </p>
              <p className="text-dim">
                expiry&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint">PASS</span> 12/29 &gt; now
              </p>
              <p className="text-dim">
                cvv&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint">PASS</span> 3 digits
              </p>
              <p className="text-fog">
                verdict&nbsp;&nbsp;&nbsp;<span className="text-mint">STRUCTURALLY VALID</span>
                <span className="blink text-faint"> ▍</span>
              </p>
              <p className="mt-1 text-faint">network calls made: <span className="text-amber">0</span></p>
            </div>
          </Reveal>
        </div>

        {/* stat strip */}
        <Reveal delay={180} className="mt-12">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line/60 sm:grid-cols-4">
            {[
              ["05", "validation methods"],
              ["11", "card networks recognised"],
              ["00", "network requests, ever"],
              ["10%", "of random strings pass Luhn"],
            ].map(([n, l]) => (
              <div key={l} className="bg-panel px-5 py-4 transition-colors hover:bg-panel2">
                <div className="font-mono text-2xl font-semibold text-mint">{n}</div>
                <div className="mt-1 text-[10.5px] tracking-[0.18em] text-dim uppercase">{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── the lab ── */}
      <section id="lab" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14">
        <SectionHeading
          index="01"
          title="The lab"
          desc="Type or load a number — the card re-skins per network, the checklist re-runs on every keystroke, and the Luhn math stays on display."
        />
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <Reveal className="lg:sticky lg:top-24">
            <CardPreview digits={digits} brand={brand} name={name} expiry={expiry} cvv={cvv} flipped={flipped} verdict={verdict} />
          </Reveal>
          <Reveal delay={100}>
            <LabForm
              digits={digits}
              setDigits={setDigits}
              expiry={expiry}
              setExpiry={setExpiry}
              cvv={cvv}
              setCvv={setCvv}
              name={name}
              setName={setName}
              setFlipped={setFlipped}
              brand={brand}
              luhn={luhn}
              expiryResult={expiryResult}
              cvvResult={cvvResult}
            />
          </Reveal>
        </div>
        <div className="mt-8">
          <Reveal delay={80}>
            <LuhnPanel digits={digits} luhn={luhn} brand={brand} />
          </Reveal>
        </div>
      </section>

      {/* ── methods ── */}
      <section id="methods" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14">
        <SectionHeading
          index="02"
          title="The five methods, in full"
          desc="The complete structural pipeline a payment form should run before a PAN ever touches your server — each stage explained, with the IIN tables underneath."
        />
        <Methods />
      </section>

      {/* ── how luhn ── */}
      <section id="howluhn" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14">
        <SectionHeading
          index="03"
          title="Luhn, slowly"
          desc="One worked example of the 1954 checksum that quietly guards every card form on earth."
        />
        <HowLuhn />
      </section>

      {/* ── batch ── */}
      <section id="batch" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14">
        <SectionHeading
          index="04"
          title="Batch sweep"
          desc="Paste a list — say, fixtures from your test suite — and get a per-line structural report with CSV export."
        />
        <BulkChecker />
      </section>

      {/* ── sandbox numbers ── */}
      <section id="sandbox" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14">
        <SectionHeading
          index="05"
          title="The sandbox shelf"
          desc="Public test PANs from payment-provider documentation. One click loads them into the lab with matching expiry and CVV."
        />
        <TestLibrary onLoad={loadSandbox} />
      </section>

      {/* ── notice ── */}
      <section id="notice" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14">
        <SectionHeading
          index="06"
          title="The line this tool won't cross"
          desc="Why “live/dead checking” isn't a feature here — and never will be."
        />
        <LegalPanel />
      </section>

      <Footer />
    </div>
  );
}
